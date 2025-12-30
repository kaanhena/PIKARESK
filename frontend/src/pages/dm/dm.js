import "./dm.css";
import { watchAuth } from "../../services/authService.js";
import { fetchAcceptedFriends } from "../../services/friendService.js";

const ACTIVE_DM_KEY = "pikaresk_active_dm";
const ACTIVE_DM_NAME_KEY = "pikaresk_active_dm_name";

export default function DM(root) {
  root.innerHTML = `
    <div class="dm-container">
      <aside class="contacts-panel">
        <div class="panel-header">
          <div class="header-title">?? Direkt Mesajlar</div>
          <input class="search-input" id="dmSearch" placeholder="Kisi ara...">
        </div>
        <div class="contacts-list" id="dmContacts"></div>
        <div class="contacts-empty" id="dmEmpty" style="display:none;">Arkadas yok.</div>
      </aside>

      <main class="chat-panel">
        <div class="animated-bg"></div>
        <header class="chat-header">
          <div class="chat-user-info">
            <div class="chat-avatar">??<div class="status-indicator online"></div></div>
            <div>
              <strong id="chat-username">Secim yok</strong>
              <div style="font-size:13px;opacity:.6">Cevrimici</div>
            </div>
          </div>
        </header>

        <div class="messages-area" id="messages"></div>

        <div class="message-input-area">
          <div class="input-container">
            <textarea class="msg-input" id="msgInput" placeholder="Mesajini yaz..."></textarea>
            <button class="send-btn" id="sendBtn">Gonder</button>
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
  const messagesData = {};
  let currentUser = null;

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
        <div class="contact-avatar">??<div class="status-indicator online"></div></div>
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
      messagesEl.innerHTML = `<div class="contacts-empty">Mesajlasmak icin arkadas sec.</div>`;
      return;
    }
    const items = messagesData[activeUser] || [];
    items.forEach((message) => {
      messagesEl.innerHTML += `
        <div class="message-wrapper ${message.from === "me" ? "own" : ""}">
          <div class="msg-avatar">${message.from === "me" ? "ME" : "U"}</div>
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
      nameOverride || item?.querySelector(".contact-name")?.textContent || "Secim yok";
    renderMessages();
  }

  contactsEl.addEventListener("click", (event) => {
    const item = event.target.closest(".contact-item");
    if (!item) return;
    setActiveUser(item.dataset.userId);
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text || !activeUser) return;
    if (!messagesData[activeUser]) messagesData[activeUser] = [];
    messagesData[activeUser].push({ from: "me", text });
    input.value = "";
    renderMessages();
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
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
