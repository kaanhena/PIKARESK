export function FriendsPage() {
  return `
    <div class="friends-container">
      <div class="friends-sidebar">
        <div class="friends-header">
          <h1>Arkadaşlar</h1>
          <button class="btn-add-friend" id="btnAddFriend">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
            Arkadaş Ekle
          </button>
        </div>

        <div class="search-container">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input type="text" id="searchInput" class="search-input" placeholder="Arkadaş ara...">
        </div>

        <div class="friends-list" id="friendsList"></div>
      </div>

      <div class="friends-main">
        <div class="profile-section">
          <div class="profile-avatar" id="profileAvatar"></div>
          <div class="profile-details">
            <h2 id="profileName">Ayşe Yılmaz</h2>
            <div class="profile-status" id="profileStatus">
              <span class="status-indicator online"></span>
              <span>Online</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="action-btn primary" id="btnMessage">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Mesaj Gönder
          </button>
          <button class="action-btn secondary" id="btnVoice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Sesli Arama
          </button>
          <button class="action-btn danger" id="btnBlock">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
            Engelle
          </button>
        </div>

        <div class="chat-container">
          <h3>Mesajlar</h3>
          <div class="messages-area" id="messagesArea">
            <div class="message received">
              <div class="message-avatar">AY</div>
              <div class="message-content">
                <div class="message-text">Merhaba! Nasılsın?</div>
                <div class="message-time">14:23</div>
              </div>
            </div>
            <div class="message sent">
              <div class="message-avatar">S</div>
              <div class="message-content">
                <div class="message-text">İyiyim, teşekkürler! Sen nasılsın?</div>
                <div class="message-time">14:25</div>
              </div>
            </div>
          </div>
          <div class="message-input-container">
            <input type="text" id="messageInput" class="message-input" placeholder="Mesaj yaz...">
            <button class="btn-send" id="btnSend">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" id="modalBackdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center; z-index: 9999;">
      <div class="modal-content" style="background: #0f172a; border-radius: 16px; padding: 32px; max-width: 480px; width: 90%; border: 1px solid rgba(100, 116, 139, 0.2);">
        <h2 style="font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0 0 24px 0;">Arkadaş Ekle</h2>
        <input type="text" id="modalInput" placeholder="Kullanıcı adını girin" style="width: 100%; padding: 14px 18px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(100, 116, 139, 0.2); border-radius: 10px; color: #e2e8f0; font-size: 15px; margin-bottom: 24px; box-sizing: border-box;">
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="btnModalCancel" style="padding: 12px 24px; border-radius: 10px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; background: rgba(30, 41, 59, 0.6); color: #e2e8f0;">İptal</button>
          <button id="btnModalConfirm" style="padding: 12px 24px; border-radius: 10px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white;">Ekle</button>
        </div>
      </div>
    </div>

    <div class="toast-notification" id="toastNotification"></div>
  `;
}

export function initializeFriendsPage() {
  const friendsData = [
    { id: 1, name: 'Ayşe Yılmaz', initials: 'AY', status: 'online' },
    { id: 2, name: 'Mehmet Kaya', initials: 'MK', status: 'online' },
    { id: 3, name: 'Zeynep Demir', initials: 'ZD', status: 'online' },
    { id: 4, name: 'Can Öztürk', initials: 'CÖ', status: 'offline' },
    { id: 5, name: 'Elif Şahin', initials: 'EŞ', status: 'offline' },
    { id: 6, name: 'Burak Arslan', initials: 'BA', status: 'online' },
    { id: 7, name: 'Selin Yıldız', initials: 'SY', status: 'offline' }
  ];

  let currentFriend = friendsData[0];

  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function updateProfileDisplay() {
    const profileName = document.getElementById('profileName');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileStatus = document.getElementById('profileStatus');
    if (profileName) profileName.textContent = currentFriend.name;
    if (profileAvatar) {
      profileAvatar.textContent = currentFriend.initials;
      profileAvatar.className = `profile-avatar ${currentFriend.status}`;
    }
    if (profileStatus) {
      const statusText = currentFriend.status === 'online' ? 'Online' : 'Offline';
      profileStatus.innerHTML = `<span class="status-indicator ${currentFriend.status}"></span><span>${statusText}</span>`;
    }
  }

  function renderFriendsList(searchTerm = '') {
    const friendsList = document.getElementById('friendsList');
    if (!friendsList) return;
    const filteredFriends = friendsData.filter(friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const sortedFriends = filteredFriends.sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === 'online' ? -1 : 1;
    });
    friendsList.innerHTML = '';
    sortedFriends.forEach(friend => {
      const friendCard = document.createElement('div');
      friendCard.className = `friend-card ${friend.id === currentFriend.id ? 'active' : ''}`;
      friendCard.innerHTML = `
        <div class="friend-avatar ${friend.status}">
          ${friend.initials}
          <span class="status-dot ${friend.status}"></span>
        </div>
        <div class="friend-info">
          <div class="friend-name">${friend.name}</div>
          <div class="friend-status-text ${friend.status}">${friend.status === 'online' ? 'Online' : 'Offline'}</div>
        </div>
        <div class="friend-quick-actions">
          <button class="quick-action-btn" data-action="message" data-friend-id="${friend.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button class="quick-action-btn" data-action="call" data-friend-id="${friend.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </button>
        </div>
      `;
      friendCard.addEventListener('click', (e) => {
        if (!e.target.closest('.quick-action-btn')) {
          currentFriend = friend;
          renderFriendsList(searchTerm);
          updateProfileDisplay();
        }
      });
      friendsList.appendChild(friendCard);
    });
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const friendId = parseInt(btn.getAttribute('data-friend-id'));
        const friend = friendsData.find(f => f.id === friendId);
        if (action === 'message') showToast(`${friend.name} ile mesajlaşma başlatıldı`);
        else if (action === 'call') showToast(`${friend.name} aranıyor...`);
      });
    });
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', (e) => renderFriendsList(e.target.value));

  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalInput = document.getElementById('modalInput');
  const btnAddFriend = document.getElementById('btnAddFriend');
  
  if (btnAddFriend) {
    btnAddFriend.addEventListener('click', () => {
      if (modalBackdrop) modalBackdrop.style.display = 'flex';
      if (modalInput) modalInput.focus();
    });
  }

  const btnModalCancel = document.getElementById('btnModalCancel');
  if (btnModalCancel) btnModalCancel.addEventListener('click', () => {
    if (modalBackdrop) modalBackdrop.style.display = 'none';
  });

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.style.display = 'none';
    });
  }

  const btnModalConfirm = document.getElementById('btnModalConfirm');
  if (btnModalConfirm) {
    btnModalConfirm.addEventListener('click', () => {
      const username = modalInput ? modalInput.value.trim() : '';
      if (username) {
        showToast(`${username} arkadaş olarak eklendi!`);
        if (modalBackdrop) modalBackdrop.style.display = 'none';
      }
    });
  }

  const btnMessage = document.getElementById('btnMessage');
  if (btnMessage) btnMessage.addEventListener('click', () => {
    showToast(`${currentFriend.name} ile mesajlaşma başlatıldı`);
    const messageInput = document.getElementById('messageInput');
    if (messageInput) messageInput.focus();
  });

  const btnVoice = document.getElementById('btnVoice');
  if (btnVoice) btnVoice.addEventListener('click', () => showToast(`${currentFriend.name} ile sesli arama başlatılıyor...`));

  const btnBlock = document.getElementById('btnBlock');
  if (btnBlock) btnBlock.addEventListener('click', () => showToast(`${currentFriend.name} engellendi`));

  const btnSend = document.getElementById('btnSend');
  const messageInput = document.getElementById('messageInput');
  
  function sendMessage() {
    const message = messageInput ? messageInput.value.trim() : '';
    if (!message) return;
    const messagesArea = document.getElementById('messagesArea');
    if (messagesArea) {
      const messageEl = document.createElement('div');
      messageEl.className = 'message sent';
      messageEl.innerHTML = `
        <div class="message-avatar">S</div>
        <div class="message-content">
          <div class="message-text">${message}</div>
          <div class="message-time">${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      `;
      messagesArea.appendChild(messageEl);
      messagesArea.scrollTop = messagesArea.scrollHeight;
      if (messageInput) messageInput.value = '';
    }
  }

  if (btnSend) btnSend.addEventListener('click', sendMessage);
  if (messageInput) messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  });

  renderFriendsList();
  updateProfileDisplay();
}