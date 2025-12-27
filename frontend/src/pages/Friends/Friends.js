// src/pages/Friends/Friends.js

export function Friends(root) {
  root.innerHTML = FriendsPage();
  initializeFriendsPage();
}

function FriendsPage() {
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
          <input type="text" id="searchInput" class="search-input" placeholder="Arkadaş ara...">
        </div>

        <div class="friends-list" id="friendsList"></div>
      </div>

      <div class="friends-main">
        <div class="profile-section">
          <div class="profile-avatar" id="profileAvatar"></div>
          <div class="profile-details">
            <h2 id="profileName"></h2>
            <div class="profile-status" id="profileStatus"></div>
          </div>
        </div>

        <div class="action-buttons">
          <button id="btnMessage">Mesaj Gönder</button>
          <button id="btnVoice">Sesli Arama</button>
          <button id="btnBlock">Engelle</button>
        </div>

        <div class="chat-container">
          <div class="messages-area" id="messagesArea"></div>
          <div class="message-input-container">
            <input type="text" id="messageInput" placeholder="Mesaj yaz...">
            <button id="btnSend">Gönder</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" id="modalBackdrop" style="display:none">
      <div class="modal-content">
        <h2>Arkadaş Ekle</h2>
        <input type="text" id="modalInput">
        <button id="btnModalCancel">İptal</button>
        <button id="btnModalConfirm">Ekle</button>
      </div>
    </div>

    <div id="toastNotification"></div>
  `;
}

function initializeFriendsPage() {
  const friendsData = [
    { id: 1, name: "Ayşe Yılmaz", initials: "AY", status: "online" },
    { id: 2, name: "Mehmet Kaya", initials: "MK", status: "offline" }
  ];

  let currentFriend = friendsData[0];

  const friendsList = document.getElementById("friendsList");
  const profileName = document.getElementById("profileName");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileStatus = document.getElementById("profileStatus");

  function renderFriends() {
    friendsList.innerHTML = "";
    friendsData.forEach(friend => {
      const div = document.createElement("div");
      div.textContent = friend.name;
      div.onclick = () => {
        currentFriend = friend;
        updateProfile();
      };
      friendsList.appendChild(div);
    });
  }

  function updateProfile() {
    profileName.textContent = currentFriend.name;
    profileAvatar.textContent = currentFriend.initials;
    profileStatus.textContent = currentFriend.status;
  }

  renderFriends();
  updateProfile();
}
