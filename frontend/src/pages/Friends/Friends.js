import {
  fetchFriendRequests,
  findUserByIdentity,
  removeFriendRequest,
  sendFriendRequest,
  updateFriendRequest,
} from "../../services/friendService.js";
import { createNotification } from "../../services/notificationService.js";
import { watchAuth } from "../../services/authService.js";

export function Friends(root) {
  const statusText = {
    online: "Arkadaş",
    pending: "İstek",
    outgoing: "Gönderildi",
    blocked: "Engellendi",
  };

  const state = {
    friends: [],
    filter: "all",
    search: "",
  };

  let currentUser = null;
  let uiReady = false;
  let gridEl = null;
  let emptyEl = null;
  let searchEl = null;
  let addBtn = null;
  let tabs = [];
  let profileModal = null;
  let profileName = null;
  let profileStatus = null;
  let closeProfileBtn = null;

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification show";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove("show"), 1600);
    setTimeout(() => toast.remove(), 2000);
  }

  function normalizeText(text) {
    return (text || "").toLowerCase().trim();
  }

  function initUI() {
    if (uiReady) return;
    uiReady = true;

    root.innerHTML = `
  <style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%}
  body{font-family:Inter,system-ui}
  .animated-bg{position:fixed;inset:0;pointer-events:none;
    background:
      radial-gradient(circle at 30% 40%,rgba(255,0,230,.1),transparent 50%),
      radial-gradient(circle at 70% 70%,rgba(0,255,255,.1),transparent 50%)}
  .friends-container{position:relative;z-index:2;height:100%;
    display:flex;flex-direction:column;gap:20px;padding:24px}
  .page-header{display:flex;justify-content:flex-start;align-items:center;gap:24px;
    background:rgba(255,255,255,.04);border-radius:18px;padding:20px}
  .header-left{display:flex;gap:16px;align-items:center;min-width:0}
  .page-icon{width:52px;height:52px;border-radius:14px;
    display:flex;align-items:center;justify-content:center;
    font-size:26px;background:linear-gradient(135deg,#ff00e6,#00ffff)}
  .header-actions{display:flex;align-items:center;flex:0 0 360px;max-width:45%}
  .search-group{display:flex;align-items:center;
    width:100%;max-width:100%;
    padding:4px;
    background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.15);
    border-radius:999px;
    box-shadow:0 6px 18px rgba(0,0,0,.18)}
  .search-input{flex:1;min-width:0;padding:10px 14px;border:none;
    background:transparent;color:#fff;outline:none}
  .add-friend-btn{width:42px;height:40px;border:none;
    border-radius:999px;
    font-weight:900;font-size:20px;line-height:1;
    background:linear-gradient(135deg,#00ff88,#00d4ff);
    background-size:200% 200%;
    cursor:pointer;transition:background-position .25s ease}
  .add-friend-btn:hover{background-position:100% 0}
  .filter-tabs{display:flex;gap:10px;background:rgba(255,255,255,.04);
    padding:10px;border-radius:16px}
  .filter-tab{cursor:pointer;padding:10px 18px;border-radius:12px;
    border:1px solid rgba(255,255,255,.1);
    background:rgba(255,255,255,.03);color:#ddd}
  .filter-tab.active{
    background:linear-gradient(135deg,rgba(255,0,230,.25),rgba(0,255,255,.25));
    color:#fff}
  .tab-count{margin-left:6px;font-weight:700}
  .friends-content{flex:1;overflow:auto;background:rgba(255,255,255,.04);
    border-radius:18px;padding:20px}
  .friends-grid{display:grid;
    grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
  .friend-card{background:rgba(255,255,255,.05);border-radius:16px;
    padding:16px;border:1px solid rgba(255,255,255,.1);
    position:relative;display:flex;flex-direction:column;gap:6px}
  .friend-name{font-weight:700}
  .friend-status{font-size:13px;opacity:.7}
  .friend-actions{display:flex;gap:8px;margin-top:8px}
  .action-button{flex:1;padding:8px;border-radius:10px;
    border:1px solid rgba(255,255,255,.15);
    background:rgba(255,255,255,.06);color:#fff;cursor:pointer}
  .action-button.primary{
    background:linear-gradient(135deg,rgba(0,255,136,.35),rgba(0,212,255,.35))}
  .action-button.danger{background:rgba(255,50,50,.25)}
  .card-menu{position:absolute;top:10px;right:10px;width:28px;height:28px;
    border-radius:8px;border:1px solid rgba(255,255,255,.15);
    background:rgba(255,255,255,.08);color:#fff;
    font-size:18px;cursor:pointer;
    display:flex;align-items:center;justify-content:center}
  .menu-dropdown{position:absolute;top:42px;right:10px;min-width:160px;
    background:rgba(20,24,60,.95);
    border:1px solid rgba(255,255,255,.15);
    border-radius:12px;display:none;
    flex-direction:column;z-index:999}
  .menu-dropdown button{
    background:none;border:none;color:#fff;
    text-align:left;padding:10px 14px;
    font-size:14px;cursor:pointer}
  .menu-dropdown button:hover{background:rgba(255,255,255,.1)}
  .empty-state{opacity:.7;text-align:center;padding:40px 0}

  @media (max-width: 980px) {
    .page-header{flex-direction:column;align-items:flex-start;gap:12px}
    .header-actions{width:100%;max-width:100%;flex:1 1 auto}
    .search-group{width:100%}
  }

  .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);
    display:none;align-items:center;justify-content:center;z-index:9999}
  .modal-backdrop.active{display:flex}
  .modal-card{background:#0f172a;border:1px solid rgba(255,255,255,.1);
    border-radius:16px;padding:20px;min-width:280px;max-width:90vw;color:#fff}
  .modal-title{font-size:18px;font-weight:700;margin-bottom:8px}
  .modal-actions{display:flex;gap:8px;margin-top:16px}
  .modal-actions button{flex:1}
  </style>

  <div class="animated-bg"></div>

  <div class="friends-container">
    <header class="page-header">
      <div class="header-left">
        <div class="page-icon">👥</div>
        <div>
          <h2>Arkadaşlar</h2>
          <p style="opacity:.6;font-size:14px">Arkadaşlarını yönet</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="search-group">
          <input class="search-input" id="friendSearch" placeholder="Kullanıcı adı veya e-posta">
          <button class="add-friend-btn" id="addFriendBtn">+</button>
        </div>
      </div>
    </header>

    <nav class="filter-tabs">
      <button class="filter-tab active" data-filter="all">
        Tümü <span class="tab-count" id="c-all"></span>
      </button>
      <button class="filter-tab" data-filter="online">
        Arkadaşlar <span class="tab-count" id="c-online"></span>
      </button>
      <button class="filter-tab" data-filter="pending">
        İstekler <span class="tab-count" id="c-pending"></span>
      </button>
      <button class="filter-tab" data-filter="blocked">
        Engellenen <span class="tab-count" id="c-blocked"></span>
      </button>
    </nav>

    <main class="friends-content">
      <div class="friends-grid" id="friendsGrid"></div>
      <div class="empty-state" id="emptyState" style="display:none;">Sonuç bulunamadı.</div>
    </main>
  </div>

  <div class="modal-backdrop" id="profileModal">
    <div class="modal-card">
      <div class="modal-title" id="profileName"></div>
      <div id="profileStatus"></div>
      <div class="modal-actions">
        <button class="action-button" id="closeProfileBtn">Kapat</button>
      </div>
    </div>
  </div>
  `;

    gridEl = root.querySelector("#friendsGrid");
    emptyEl = root.querySelector("#emptyState");
    searchEl = root.querySelector("#friendSearch");
    addBtn = root.querySelector("#addFriendBtn");
    tabs = Array.from(root.querySelectorAll(".filter-tab"));
    profileModal = root.querySelector("#profileModal");
    profileName = root.querySelector("#profileName");
    profileStatus = root.querySelector("#profileStatus");
    closeProfileBtn = root.querySelector("#closeProfileBtn");

    const seededSearch = localStorage.getItem("pikaresk_friends_search");
    if (seededSearch) {
      searchEl.value = seededSearch;
      state.search = seededSearch;
      localStorage.removeItem("pikaresk_friends_search");
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        state.filter = tab.dataset.filter || "all";
        renderList();
      });
    });

    searchEl.addEventListener("input", () => {
      state.search = searchEl.value;
      renderList();
    });

    addBtn.addEventListener("click", async () => {
      const name = searchEl.value.trim();
      if (!name) return;
      if (!currentUser) {
        showToast("Giriş yapmalısın.");
        return;
      }
      try {
        const target = await findUserByIdentity(name);
        if (!target) {
          showToast("Kullanıcı bulunamadı.");
          return;
        }
        if (target.id === currentUser.uid) {
          showToast("Kendini ekleyemezsin.");
          return;
        }
        const result = await sendFriendRequest(currentUser, target);
        if (result.status !== "pending") {
          showToast("Bu kullanıcı zaten listende.");
        } else {
          showToast("Arkadaş isteği gönderildi.");
        }
        await refreshFriends();
      } catch (error) {
        showToast(error?.message || "Arkadaş isteği gönderilemedi.");
      }
    });

    gridEl.addEventListener("click", (event) => {
      const menuBtn = event.target.closest(".card-menu");
      if (menuBtn) {
        event.stopPropagation();
        const menu = menuBtn.nextElementSibling;
        const open = menu.style.display === "flex";
        root.querySelectorAll(".menu-dropdown").forEach((m) => {
          m.style.display = "none";
        });
        menu.style.display = open ? "none" : "flex";
        return;
      }

      const actionBtn = event.target.closest("[data-action]");
      if (!actionBtn) return;
      const card = event.target.closest(".friend-card");
      if (!card) return;
      const friend = state.friends.find((f) => f.id === card.dataset.id);
      handleAction(actionBtn.dataset.action, friend);
    });

    document.addEventListener("click", () => {
      root.querySelectorAll(".menu-dropdown").forEach((m) => {
        m.style.display = "none";
      });
    });

    profileModal.addEventListener("click", (event) => {
      if (event.target === profileModal) closeProfile();
    });

    closeProfileBtn.addEventListener("click", closeProfile);
  }

  function buildMenu(friend) {
    if (friend.status === "blocked") {
      return `
        <button data-action="profile">Profil</button>
        <button data-action="unblock">Engeli Kaldır</button>
        <button data-action="remove">Arkadaşlıktan Çıkar</button>
      `;
    }
    if (friend.status === "pending" && !friend.isOutgoing) {
      return `
        <button data-action="profile">Profil</button>
        <button data-action="accept">Kabul</button>
        <button data-action="reject">Reddet</button>
        <button data-action="block">Engelle</button>
      `;
    }
    if (friend.status === "outgoing") {
      return `
        <button data-action="profile">Profil</button>
        <button data-action="cancel">İptal Et</button>
      `;
    }
    return `
      <button data-action="profile">Profil</button>
      <button data-action="dm">Mesaj</button>
      <button data-action="block">Engelle</button>
      <button data-action="remove">Arkadaşlıktan Çıkar</button>
    `;
  }

  function buildActions(friend) {
    if (friend.status === "blocked") {
      return `<button class="action-button primary" data-action="unblock">Engeli Kaldır</button>`;
    }
    if (friend.status === "pending" && !friend.isOutgoing) {
      return `
        <button class="action-button primary" data-action="accept">Kabul</button>
        <button class="action-button danger" data-action="reject">Reddet</button>
      `;
    }
    if (friend.status === "outgoing") {
      return `<button class="action-button danger" data-action="cancel">İptal Et</button>`;
    }
    return `
      <button class="action-button primary" data-action="dm">Mesaj</button>
      <button class="action-button danger" data-action="block">Engelle</button>
    `;
  }

  function renderCounts() {
    const countPending = state.friends.filter(
      (f) => f.status === "pending" || f.status === "outgoing"
    ).length;
    root.querySelector("#c-all").textContent = state.friends.length;
    root.querySelector("#c-online").textContent = state.friends.filter(
      (f) => f.status === "online"
    ).length;
    root.querySelector("#c-pending").textContent = countPending;
    root.querySelector("#c-blocked").textContent = state.friends.filter(
      (f) => f.status === "blocked"
    ).length;
  }

  function getFiltered() {
    const search = normalizeText(state.search);
    return state.friends.filter((friend) => {
      const matchesFilter =
        state.filter === "all" ||
        friend.status === state.filter ||
        (state.filter === "pending" && friend.status === "outgoing");
      const matchesSearch = !search || normalizeText(friend.name).includes(search);
      return matchesFilter && matchesSearch;
    });
  }

  function renderList() {
    const list = getFiltered();
    gridEl.innerHTML = list
      .map(
        (friend) => `
      <div class="friend-card" data-id="${friend.id}" data-status="${friend.status}">
        <button class="card-menu">?</button>
        <div class="menu-dropdown">
          ${buildMenu(friend)}
        </div>
        <div class="friend-name">${friend.name}</div>
        <div class="friend-status">${statusText[friend.status] || friend.status}</div>
        <div class="friend-actions">
          ${buildActions(friend)}
        </div>
      </div>
    `
      )
      .join("");

    emptyEl.style.display = list.length === 0 ? "block" : "none";
  }

  function openProfile(friend) {
    profileName.textContent = friend.name;
    const email = friend.email ? ` - ${friend.email}` : "";
    profileStatus.textContent = `${statusText[friend.status] || friend.status}${email}`;
    profileModal.classList.add("active");
  }

  function closeProfile() {
    profileModal.classList.remove("active");
  }

  async function handleAction(action, friend) {
    if (!friend) return;

    if (action === "profile") {
      openProfile(friend);
      return;
    }

    if (action === "dm") {
      if (friend.status === "blocked") return;
      localStorage.setItem("pikaresk_active_dm", friend.id);
      localStorage.setItem("pikaresk_active_dm_name", friend.name);
      window.PIKARESK?.go?.("dm");
      return;
    }

    if (action === "accept") {
      await updateFriendRequest(friend.requestId, { status: "accepted" });
      if (currentUser) {
        try {
          await createNotification({
            toUid: friend.id,
            type: "friend_accept",
            title: "Arkadaşlık kabul edildi",
            body: `${currentUser.displayName || currentUser.email || "Bir kullanıcı"} isteğini kabul etti.`,
            meta: { fromUid: currentUser.uid },
          });
        } catch {
          // ignore notification errors
        }
      }
    }

    if (action === "reject" || action === "remove" || action === "cancel") {
      await removeFriendRequest(friend.requestId);
    }

    if (action === "block") {
      await updateFriendRequest(friend.requestId, { status: "blocked" });
    }

    if (action === "unblock") {
      await updateFriendRequest(friend.requestId, { status: "accepted" });
    }

    await refreshFriends();
  }

  async function refreshFriends() {
    if (!currentUser) return;
    const requests = await fetchFriendRequests(currentUser.uid);
    state.friends = requests.map((request) => {
      const isOutgoing = request.fromUid === currentUser.uid;
      const name = isOutgoing ? request.toName : request.fromName;
      const email = isOutgoing ? request.toEmail : request.fromEmail;
      let status = request.status || "pending";
      if (status === "pending" && isOutgoing) status = "outgoing";
      if (status === "accepted") status = "online";
      return {
        id: isOutgoing ? request.toUid : request.fromUid,
        name: name || email || "Kullanıcı",
        email: email || "",
        status,
        requestId: request.id,
        isOutgoing,
      };
    });
    renderCounts();
    renderList();
  }

  watchAuth((user) => {
    currentUser = user;
    if (!user) {
      root.innerHTML = `<div class="empty-state">Giriş yapman gerekiyor.</div>`;
      return;
    }
    initUI();
    refreshFriends();
  });
}
