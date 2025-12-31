import "./dm.css";
import { watchAuth } from "../../services/authService.js";
import { fetchAcceptedFriends } from "../../services/friendService.js";
import { loadSettings, saveSettings } from "../../utils/settings.js";
import {
  buildThreadId,
  listenThreadMessages,
  listenUserMessages,
  markThreadRead,
  sendMessage,
} from "../../services/messageService.js";

const ACTIVE_DM_KEY = "pikaresk_active_dm";
const ACTIVE_DM_NAME_KEY = "pikaresk_active_dm_name";

export default function DM(root) {
  root.innerHTML = `
    <div class="dm-container">
      <aside class="contacts-panel">
        <div class="panel-header">
          <div class="header-title">Direkt Mesajlar</div>
          <input class="search-input" id="dmSearch" placeholder="Kisi ara...">
        </div>
        <div class="contacts-list" id="dmContacts"></div>
        <div class="contacts-empty" id="dmEmpty" style="display:none;">Arkadas yok.</div>
      </aside>

      <main class="chat-panel">
        <div class="animated-bg"></div>
        <header class="chat-header">
          <div class="chat-user-info">
            <div class="chat-avatar">DM<div class="status-indicator online"></div></div>
            <div>
              <strong id="chat-username">Secim yok</strong>
              <div style="font-size:13px;opacity:.6">Cevrimici</div>
            </div>
          </div>
          <div class="chat-actions">
            <button class="chat-action-btn icon-btn" id="muteThreadBtn" type="button" aria-label="Sessize al"></button>
            <button class="chat-action-btn icon-btn" id="soundToggleBtn" type="button" aria-label="Mesaj sesi"></button>
          </div>
        </header>

        <div class="messages-area" id="messages"></div>

        <div class="message-input-area">
          <div class="input-container">
            <button class="attach-btn" id="attachBtn" type="button" aria-label="Dosya ekle">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16.5 6.5l-7.8 7.8a3 3 0 1 0 4.2 4.2l7.8-7.8a5 5 0 0 0-7.1-7.1l-8.5 8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="emoji-toggle" id="emojiToggle" type="button" aria-label="Emoji">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="10" r="1.2" fill="currentColor"/>
                <circle cx="15" cy="10" r="1.2" fill="currentColor"/>
                <path d="M8.5 14.5c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <input type="file" id="fileInput" class="file-input" />
            <textarea class="msg-input" id="msgInput" placeholder="Mesajini yaz..."></textarea>
            <button class="send-btn icon-btn" id="sendBtn" aria-label="Gonder">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12l16-8-5 8 5 8-16-8z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div class="emoji-row" id="emojiRow">
            <button type="button" data-emoji="&#128578;">&#128578;</button>
            <button type="button" data-emoji="&#128514;">&#128514;</button>
            <button type="button" data-emoji="&#128293;">&#128293;</button>
            <button type="button" data-emoji="&#127918;">&#127918;</button>
            <button type="button" data-emoji="&#10084;">&#10084;</button>
          </div>
        </div>
      </main>
    </div>
  `;

  const messagesEl = root.querySelector("#messages");
  const input = root.querySelector("#msgInput");
  const sendBtn = root.querySelector("#sendBtn");
  const usernameEl = root.querySelector("#chat-username");
  const contactsEl = root.querySelector("#dmContacts");
  const emptyEl = root.querySelector("#dmEmpty");
  const searchEl = root.querySelector("#dmSearch");
  const muteThreadBtn = root.querySelector("#muteThreadBtn");
  const soundToggleBtn = root.querySelector("#soundToggleBtn");
  const attachBtn = root.querySelector("#attachBtn");
  const fileInput = root.querySelector("#fileInput");
  const emojiToggle = root.querySelector("#emojiToggle");
  const emojiRow = root.querySelector("#emojiRow");

  let activeUser = "";
  let friends = [];
  let currentUser = null;
  let stopThread = null;
  let threadMessages = [];
  let mutedThreads = new Set();
  let messageSummary = {};
  let stopSummary = null;
  let pendingAttachment = null;
  let lastMessageId = "";
  let hasLoadedThread = false;
  let settings = loadSettings();

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification show";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove("show"), 1600);
    setTimeout(() => toast.remove(), 2000);
  }

  function loadMutedThreads() {
    try {
      const raw = localStorage.getItem("pikaresk_muted_threads");
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }

  function saveMutedThreads() {
    localStorage.setItem("pikaresk_muted_threads", JSON.stringify(Array.from(mutedThreads)));
  }

  function updateMuteButton(threadId) {
    if (!muteThreadBtn) return;
    const muted = mutedThreads.has(threadId);
    muteThreadBtn.innerHTML = `<span class="mute-icon${muted ? " is-muted" : ""}">M</span>`;
    muteThreadBtn.setAttribute("aria-label", muted ? "Sessizden cik" : "Sessize al");
    muteThreadBtn.dataset.muted = muted ? "true" : "false";
  }

  function updateSoundButton() {
    if (!soundToggleBtn) return;
    const enabled = !!settings.messageSound;
    soundToggleBtn.innerHTML = `<span class="sound-icon${enabled ? "" : " is-off"}">S</span>`;
    soundToggleBtn.setAttribute("aria-label", enabled ? "Mesaj sesi acik" : "Mesaj sesi kapali");
  }

  function playMessageSound() {
    if (!settings.messageSound) return;
    try {
      const volume = Math.max(0, Math.min(1, (settings.soundVolume || 70) / 100));
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const now = ctx.currentTime;
      oscillator.type = "sine";
      overtone.type = "sine";
      oscillator.frequency.value = 440;
      overtone.frequency.value = 660;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume * 0.1, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      oscillator.connect(gainNode);
      overtone.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(now);
      overtone.start(now + 0.02);
      oscillator.stop(now + 0.55);
      overtone.stop(now + 0.55);
      oscillator.onended = () => ctx.close();
    } catch {
      // ignore audio errors
    }
  }

  function getFilteredFriends(search) {
    const s = (search || "").toLowerCase().trim();
    return friends.filter((f) => !s || f.name.toLowerCase().includes(s));
  }

  function renderContacts() {
    const list = getFilteredFriends(searchEl.value);
    contactsEl.innerHTML = list
      .map((friend) => {
        const summary = messageSummary[friend.id] || {};
        const unread = summary.unread || 0;
        const lastText = summary.lastText || "";
        const threadId = buildThreadId(friend.id, currentUser?.uid || "");
        const muted = mutedThreads.has(threadId);
        return `
      <div class="contact-item" data-user-id="${friend.id}">
        <div class="contact-avatar">DM<div class="status-indicator online"></div></div>
        <div class="contact-meta">
          <div class="contact-name">${friend.name}</div>
          <div class="contact-last-msg">${lastText}</div>
        </div>
        <div class="contact-badges">
          ${muted ? `<span class="contact-muted">M</span>` : ""}
          ${!muted && unread > 0 ? `<span class="contact-unread">${unread}</span>` : ""}
        </div>
      </div>
    `;
      })
      .join("");

    emptyEl.style.display = list.length === 0 ? "block" : "none";

    const storedId = localStorage.getItem(ACTIVE_DM_KEY);
    const storedName = localStorage.getItem(ACTIVE_DM_NAME_KEY);
    if (storedId && list.some((f) => f.id === storedId)) {
      setActiveUser(storedId, storedName);
      return;
    }
    if (list.length > 0 && (!activeUser || !list.some((f) => f.id === activeUser))) {
      setActiveUser(list[0].id, list[0].name);
      return;
    }
    if (list.length === 0) {
      setActiveUser("", "");
    }
  }

  function renderMessages() {
    messagesEl.innerHTML = "";
    if (!activeUser) {
      messagesEl.innerHTML = `<div class="contacts-empty">Mesajlasmak icin arkadas sec.</div>`;
      return;
    }
    threadMessages.forEach((message) => {
      const isMine = message.fromUid === currentUser?.uid;
      const readMark = isMine && Array.isArray(message.readBy) && message.readBy.length > 1 ? "&#10003;&#10003;" : "";
      let body = message.text || "";
      if (message.type === "file" && message.attachment) {
        const dataUrl = message.attachment.dataUrl;
        const name = message.attachment.name || "Dosya";
        if (message.attachment.type?.startsWith("image/") && dataUrl) {
          body = `<img src="${dataUrl}" alt="${name}" class="msg-image" />`;
        } else if (dataUrl) {
          body = `<a href="${dataUrl}" download="${name}" class="msg-file">${name}</a>`;
        } else {
          body = name;
        }
      }
      messagesEl.innerHTML += `
        <div class="message-wrapper ${isMine ? "own" : ""}">
          <div class="msg-avatar">${isMine ? "ME" : "U"}</div>
          <div class="msg-bubble">
            ${body}
            ${readMark ? `<span class="msg-read">${readMark}</span>` : ""}
          </div>
        </div>
      `;
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setActiveUser(id, nameOverride) {
    const item = contactsEl.querySelector(`.contact-item[data-user-id="${id}"]`);
    contactsEl.querySelectorAll(".contact-item").forEach((i) => i.classList.remove("active"));
    if (item) item.classList.add("active");
    activeUser = id;
    usernameEl.textContent =
      nameOverride || item?.querySelector(".contact-name")?.textContent || "Secim yok";
    if (stopThread) {
      stopThread();
      stopThread = null;
    }
    hasLoadedThread = false;
    lastMessageId = "";
    if (currentUser && activeUser) {
      const threadId = buildThreadId(currentUser.uid, activeUser);
      updateMuteButton(threadId);
      stopThread = listenThreadMessages(
        threadId,
        currentUser.uid,
        (items) => {
          const lastItem = items[items.length - 1];
          if (!hasLoadedThread) {
            lastMessageId = lastItem?.id || "";
            hasLoadedThread = true;
          } else if (lastItem?.id && lastItem.id !== lastMessageId) {
            if (lastItem.fromUid && lastItem.fromUid !== currentUser.uid) {
              playMessageSound();
            }
            lastMessageId = lastItem.id;
          }
          threadMessages = items;
          renderMessages();
          markThreadRead(threadId, currentUser.uid).catch(() => {});
        },
        (error) => {
          console.warn("DM listener error:", error?.code || error);
          showToast("Mesajlar yuklenemedi.");
        }
      );
    } else {
      threadMessages = [];
      renderMessages();
    }
  }

  contactsEl.addEventListener("click", (event) => {
    const item = event.target.closest(".contact-item");
    if (!item) return;
    setActiveUser(item.dataset.userId);
  });

  async function sendMessageHandler() {
    const text = input.value.trim();
    if (!activeUser || !currentUser || (!text && !pendingAttachment)) return;
    const attachment = pendingAttachment;
    pendingAttachment = null;
    input.value = "";
    try {
      await sendMessage({
        fromUid: currentUser.uid,
        toUid: activeUser,
        text,
        attachment,
      });
    } catch {
      // swallow errors for now
    }
  }

  sendBtn.addEventListener("click", sendMessageHandler);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessageHandler();
    }
  });

  attachBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingAttachment = {
        name: file.name,
        type: file.type || "application/octet-stream",
        dataUrl: reader.result,
      };
      showToast("Dosya eklendi.");
    };
    reader.readAsDataURL(file);
  });

  emojiRow.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const emoji = button.dataset.emoji || button.textContent || "";
    if (!emoji) return;
    input.value = `${input.value || ""}${emoji}`;
    input.focus();
  });

  emojiToggle.addEventListener("click", () => {
    emojiRow.classList.toggle("visible");
  });

  muteThreadBtn.addEventListener("click", () => {
    if (!currentUser || !activeUser) return;
    const threadId = buildThreadId(currentUser.uid, activeUser);
    if (mutedThreads.has(threadId)) {
      mutedThreads.delete(threadId);
    } else {
      mutedThreads.add(threadId);
    }
    saveMutedThreads();
    updateMuteButton(threadId);
    renderContacts();
  });

  soundToggleBtn.addEventListener("click", () => {
    settings = { ...settings, messageSound: !settings.messageSound };
    saveSettings(settings);
    updateSoundButton();
  });

  searchEl.addEventListener("input", renderContacts);

  updateSoundButton();

  watchAuth((user) => {
    currentUser = user;
    settings = loadSettings();
    updateSoundButton();
    if (!user) {
      friends = [];
      messageSummary = {};
      if (stopSummary) {
        stopSummary();
        stopSummary = null;
      }
      renderContacts();
      return;
    }
    mutedThreads = loadMutedThreads();
    if (stopSummary) stopSummary();
    stopSummary = listenUserMessages(
      user.uid,
      (items) => {
        const summary = {};
        items.forEach((message) => {
          const otherId = message.fromUid === user.uid ? message.toUid : message.fromUid;
          if (!summary[otherId]) {
            summary[otherId] = { lastText: "", unread: 0 };
          }
          if (!summary[otherId].lastText) {
            summary[otherId].lastText = message.type === "file" ? "Dosya paylasildi" : message.text;
          }
          const isUnread =
            message.toUid === user.uid &&
            (!Array.isArray(message.readBy) || !message.readBy.includes(user.uid));
          if (isUnread) {
            summary[otherId].unread += 1;
          }
        });
        messageSummary = summary;
        renderContacts();
      },
      (error) => {
        console.warn("DM summary error:", error?.code || error);
      }
    );
    fetchAcceptedFriends(user.uid)
      .then((list) => {
        friends = list.map((friend) => ({
          id: friend.id,
          name: friend.name || friend.email || friend.id,
        }));
        renderContacts();
      })
      .catch(() => {
        friends = [];
        renderContacts();
      });
  });
}






















