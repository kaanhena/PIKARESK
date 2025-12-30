import './dm.css';

const ACTIVE_DM_KEY = 'pikaresk_active_dm';
const ACTIVE_DM_NAME_KEY = 'pikaresk_active_dm_name';
const FRIENDS_KEY = 'pikaresk_friends';

export default function DM(root) {
  root.innerHTML = `
        <div class="dm-container">
      <aside class="contacts-panel">
        <div class="panel-header">
          <div class="header-title">💬 Direkt Mesajlar</div>
          <input class="search-input" id="dmSearch" placeholder="Kişi ara...">
        </div>
        <div class="contacts-list" id="dmContacts"></div>
        <div class="contacts-empty" id="dmEmpty" style="display:none;">Çevrimiçi kişi yok.</div>
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

  const messagesData = {
    ayse: [
      { from: 'other', text: 'Merhaba! Hazır mısın?' },
      { from: 'me', text: 'Evet, 15:00 değil mi?' }
    ],
    mehmet: [
      { from: 'other', text: 'Toplantı saat kaçta?' }
    ]
  };

  const messagesEl = root.querySelector('#messages');
  const input = root.querySelector('#msgInput');
  const sendBtn = root.querySelector('#sendBtn');
  const usernameEl = root.querySelector('#chat-username');
  const contactsEl = root.querySelector('#dmContacts');
  const emptyEl = root.querySelector('#dmEmpty');
  const searchEl = root.querySelector('#dmSearch');

  let activeUser = '';
  let friends = [];

  function loadFriends() {
    try {
      const data = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function getOnlineFriends(search) {
    const s = (search || '').toLowerCase().trim();
    return friends.filter(f => f.status === 'online')
      .filter(f => !s || f.name.toLowerCase().includes(s));
  }

  function renderContacts() {
    const list = getOnlineFriends(searchEl.value);
    contactsEl.innerHTML = list.map(friend => `
      <div class="contact-item" data-user-id="${friend.id}">
        <div class="contact-avatar">👤<div class="status-indicator online"></div></div>
        <div>
          <div class="contact-name">${friend.name}</div>
          <div class="contact-last-msg"></div>
        </div>
      </div>
    `).join('');

    emptyEl.style.display = list.length === 0 ? 'block' : 'none';

    const storedId = localStorage.getItem(ACTIVE_DM_KEY);
    const storedName = localStorage.getItem(ACTIVE_DM_NAME_KEY);
    if (storedId && list.some(f => f.id === storedId)) {
      setActiveUser(storedId, storedName);
      return;
    }
    if (list.length > 0 && (!activeUser || !list.some(f => f.id === activeUser))) {
      setActiveUser(list[0].id, list[0].name);
    }
  }

  function renderMessages() {
    messagesEl.innerHTML = '';
    const items = messagesData[activeUser] || [];
    items.forEach(m => {
      messagesEl.innerHTML += `
        <div class="message-wrapper ${m.from === 'me' ? 'own' : ''}">
          <div class="msg-avatar">${m.from === 'me' ? 'ME' : 'U'}</div>
          <div class="msg-bubble">${m.text}</div>
        </div>
      `;
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setActiveUser(id, nameOverride) {
    const item = contactsEl.querySelector(`.contact-item[data-user-id="${id}"]`);
    contactsEl.querySelectorAll('.contact-item').forEach(i => i.classList.remove('active'));
    if (item) item.classList.add('active');
    activeUser = id;
    usernameEl.textContent = nameOverride || item?.querySelector('.contact-name')?.textContent || id;
    if (!messagesData[activeUser]) messagesData[activeUser] = [];
    renderMessages();
  }

  contactsEl.addEventListener('click', (e) => {
    const item = e.target.closest('.contact-item');
    if (!item) return;
    setActiveUser(item.dataset.userId);
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text || !activeUser) return;
    if (!messagesData[activeUser]) messagesData[activeUser] = [];
    messagesData[activeUser].push({ from: 'me', text });
    input.value = '';
    renderMessages();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  searchEl.addEventListener('input', renderContacts);

  friends = loadFriends();
  renderContacts();
}
