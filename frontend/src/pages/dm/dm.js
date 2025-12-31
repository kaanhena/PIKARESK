import "./dm.css";
import { watchAuth } from "../../services/authService.js";
import { fetchAcceptedFriends } from "../../services/friendService.js";
import { createNotification } from "../../services/notificationService.js";
import { buildThreadId, listenThreadMessages, sendMessage } from "../../services/messageService.js";

const ACTIVE_DM_KEY = "pikaresk_active_dm";
const ACTIVE_DM_NAME_KEY = "pikaresk_active_dm_name";

export default function DM(root) {
  root.innerHTML = `
    <div class="dm-container">
      <aside class="contacts-panel">
        <div class="panel-header">
          <div class="header-title">💬 Direkt Mesajlar</div>
          <input class="search-input" id="dmSearch" placeholder="Kişi ara...">
        </div>
        <div class="contacts-list" id="dmContacts"></div>
        <div class="contacts-empty" id="dmEmpty" style="display:none;">Arkadaş yok.</div>
      </aside>

      <main class="chat-panel">
        <div class="animated-bg"></div>
        <header class="chat-header">
          <div class="chat-user-info">
            <div class="chat-avatar">👤<div class="status-indicator online"></div></div>
            <div>
              <strong id="chat-username">Seçim yok</strong>
              <div style="font-size:13px;opacity:.6">Çevrimiçi</div>
            </div>
          </div>
        </header>

        <div class="messages-area" id="messages"></div>

        <div class="message-input-area">
          <div class="input-container">
            <textarea class="msg-input" id="msgInput" placeholder="Mesajını yaz..."></textarea>
            <button class="send-btn" id="sendBtn">Gönder</button>
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

  let activeUser = "";
  let friends = [];
  let currentUser = null;
  let stopThread = null;
  let threadMessages = [];

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification show";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove("show"), 1600);
    setTimeout(() => toast.remove(), 2000);
  }

  function getFilteredFriends(search) {
    const s = (search || "").toLowerCase().trim();
    return friends.filter((f) => !s || f.name.toLowerCase().includes(s));
  }

  function renderContacts() {
    const list = getFilteredFriends(searchEl.value);
    contactsEl.innerHTML = list
      .map(
        (friend) => `
      <div class="contact-item" data-user-id="${friend.id}">
        <div class="contact-avatar">👤<div class="status-indicator online"></div></div>
        <div>
          <div class="contact-name">${friend.name}</div>
          <div class="contact-last-msg"></div>
        </div>
      </div>
    `
      )
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
      messagesEl.innerHTML = `<div class="contacts-empty">Mesajlaşmak için arkadaş seç.</div>`;
      return;
    }
    threadMessages.forEach((message) => {
      const isMine = message.fromUid === currentUser?.uid;
      messagesEl.innerHTML += `
        <div class="message-wrapper ${isMine ? "own" : ""}">
          <div class="msg-avatar">${isMine ? "ME" : "U"}</div>
          <div class="msg-bubble">${message.text}</div>
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
      nameOverride || item?.querySelector(".contact-name")?.textContent || "Seçim yok";
    if (stopThread) {
      stopThread();
      stopThread = null;
    }
    if (currentUser && activeUser) {
      const threadId = buildThreadId(currentUser.uid, activeUser);
      stopThread = listenThreadMessages(
        threadId,
        currentUser.uid,
        (items) => {
          threadMessages = items;
          renderMessages();
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
    if (!text || !activeUser || !currentUser) return;
    input.value = "";
    try {
      await sendMessage({ fromUid: currentUser.uid, toUid: activeUser, text });
      const target = friends.find((f) => f.id === activeUser);
      await createNotification({
        toUid: activeUser,
        type: "message",
        title: "Yeni mesaj",
        body: `${currentUser.displayName || currentUser.email || "Bir kullanıcı"}: ${text}`,
        meta: { fromUid: currentUser.uid, threadId: buildThreadId(currentUser.uid, activeUser) },
      });
      if (!target) {
        // keep UI stable even if contact list is stale
      }
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

  searchEl.addEventListener("input", renderContacts);

  watchAuth((user) => {
    currentUser = user;
    if (!user) {
      friends = [];
      renderContacts();
      return;
    }
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
