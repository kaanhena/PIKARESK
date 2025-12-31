import { searchProducts, searchUsers } from "../services/searchService.js";
import { watchAuth } from "../services/authService.js";
import {
  listenNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService.js";

export function Header(root, { title = "PIKARESK", onLogout } = {}) {
  root.innerHTML = `
    <header class="app-header main-header">
      <div class="header-logo" id="headerHome">
        <div class="logo-icon">
          <span class="logo-icon-text">P</span>
        </div>
        <div class="logo-text">
          <div class="logo-title">${title}</div>
          <div class="logo-subtitle">Gaming Community</div>
        </div>
      </div>

      <div class="header-actions">
        <button class="search-btn" type="button" aria-label="Arama" id="openSearchBtn">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 3a8 8 0 1 1 0 16a8 8 0 0 1 0-16m0 2a6 6 0 1 0 0 12a6 6 0 0 0 0-12m9.7 14.3l-3.4-3.4a1 1 0 0 0-1.4 1.4l3.4 3.4a1 1 0 0 0 1.4-1.4z"/>
          </svg>
        </button>
        <button class="notification-btn" type="button" aria-label="Bildirimler" id="openNotifyBtn">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a5 5 0 0 1 5 5v2.7l1.3 2.6A2 2 0 0 1 16.5 16H7.5a2 2 0 0 1-1.8-2.7L7 10.7V8a5 5 0 0 1 5-5zm0 18a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 21z"/>
          </svg>
          <span class="notification-badge" id="notificationBadge" style="display:none;">0</span>
        </button>

        <div class="user-profile" role="button" tabindex="0" id="headerProfile">
          <span class="user-name" data-user-name>Kullanıcı</span>
          <div class="user-avatar">
            <span data-user-initial>K</span>
            <span class="status-indicator" aria-hidden="true"></span>
          </div>
        </div>

        <button class="btn btn-ghost" id="logoutBtn" type="button">Çıkış</button>
      </div>
    </header>
    <div class="header-search-panel" id="headerSearchPanel" aria-hidden="true">
      <div class="header-search-backdrop" data-action="close-search"></div>
      <div class="header-search-box" role="dialog" aria-modal="true" aria-label="Arama">
        <div class="header-search-input-wrap">
          <input
            class="header-search-input"
            id="headerSearchInput"
            type="text"
            placeholder="Kullanıcı veya ürün ara..."
            autocomplete="off"
          >
          <button class="header-search-close" type="button" data-action="close-search">Kapat</button>
        </div>
        <div class="header-search-results" id="headerSearchResults">
          <div class="header-search-empty">Aramak için yazmaya başla.</div>
        </div>
      </div>
    </div>
    <div class="header-notify-panel" id="headerNotifyPanel" aria-hidden="true">
      <div class="header-notify-backdrop" data-action="close-notify"></div>
      <div class="header-notify-box" role="dialog" aria-modal="true" aria-label="Bildirimler">
        <div class="header-notify-head">
          <span>Bildirimler</span>
          <button class="header-notify-clear" type="button" id="markAllNotifyBtn">Tümünü okundu</button>
        </div>
        <div class="header-notify-list" id="headerNotifyList">
          <div class="header-search-empty">Bildirim yok.</div>
        </div>
      </div>
    </div>
  `;
  const btn = root.querySelector("#logoutBtn");
  btn?.addEventListener("click", () => onLogout?.());
  const headerHome = root.querySelector("#headerHome");
  headerHome?.addEventListener("click", () => {
    window.PIKARESK?.go?.("home");
  });
  const headerProfile = root.querySelector("#headerProfile");
  headerProfile?.addEventListener("click", () => {
    window.PIKARESK?.go?.("profile");
  });

  const openBtn = root.querySelector("#openSearchBtn");
  const panel = root.querySelector("#headerSearchPanel");
  const input = root.querySelector("#headerSearchInput");
  const results = root.querySelector("#headerSearchResults");
  const notifyBtn = root.querySelector("#openNotifyBtn");
  const notifyPanel = root.querySelector("#headerNotifyPanel");
  const notifyList = root.querySelector("#headerNotifyList");
  const notifyBadge = root.querySelector("#notificationBadge");
  const notifyMarkAll = root.querySelector("#markAllNotifyBtn");

  function setPanel(open) {
    if (!panel) return;
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      setNotifyPanel(false);
      input?.focus();
      input?.select();
    }
  }

  function setNotifyPanel(open) {
    if (!notifyPanel) return;
    notifyPanel.classList.toggle("is-open", open);
    notifyPanel.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      setPanel(false);
    }
  }

  function renderEmpty(message) {
    if (results) {
      results.innerHTML = `<div class="header-search-empty">${message}</div>`;
    }
  }

  function renderResults({ users, products }) {
    if (!results) return;
    const userItems = users
      .map((user) => {
        const label = user.displayName || user.email || "Kullanıcı";
        const meta = user.email || "";
        const encoded = encodeURIComponent(label);
        return `
          <button class="header-search-item" type="button" data-type="user" data-name="${encoded}">
            <span class="header-search-item-title">${label}</span>
            ${meta ? `<span class="header-search-item-meta">${meta}</span>` : ""}
          </button>
        `;
      })
      .join("");
    const productItems = products
      .map((product) => {
        const encoded = encodeURIComponent(product.name);
        return `
          <button class="header-search-item" type="button" data-type="product" data-name="${encoded}">
            <span class="header-search-item-title">${product.name}</span>
            <span class="header-search-item-meta">Market · ${product.description}</span>
          </button>
        `;
      })
      .join("");

    const sections = [];
    if (userItems) {
      sections.push(`
        <div class="header-search-section">
          <div class="header-search-section-title">Kullanıcılar</div>
          <div class="header-search-section-list">${userItems}</div>
        </div>
      `);
    }
    if (productItems) {
      sections.push(`
        <div class="header-search-section">
          <div class="header-search-section-title">Market</div>
          <div class="header-search-section-list">${productItems}</div>
        </div>
      `);
    }
    results.innerHTML =
      sections.join("") || `<div class="header-search-empty">Sonuç bulunamadı.</div>`;
  }

  let searchTimer = null;
  async function handleSearch() {
    const query = input?.value?.trim() || "";
    if (!query) {
      renderEmpty("Aramak için yazmaya başla.");
      return;
    }
    renderEmpty("Aranıyor...");
    try {
      const [users, products] = await Promise.all([
        searchUsers(query, 6),
        Promise.resolve(searchProducts(query, 6)),
      ]);
      renderResults({ users, products });
    } catch (error) {
      renderEmpty("Arama sırasında hata oluştu.");
    }
  }

  openBtn?.addEventListener("click", () => setPanel(true));
  panel?.addEventListener("click", (event) => {
    const action = event.target?.getAttribute("data-action");
    if (action === "close-search") {
      setPanel(false);
    }
  });
  input?.addEventListener("input", () => {
    if (searchTimer) window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(handleSearch, 200);
  });
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setPanel(false);
    }
  });
  results?.addEventListener("click", (event) => {
    const button = event.target.closest(".header-search-item");
    if (!button) return;
    const type = button.getAttribute("data-type");
    const rawName = button.getAttribute("data-name");
    const name = rawName ? decodeURIComponent(rawName) : "";
    if (type === "user") {
      if (name) {
        localStorage.setItem("pikaresk_friends_search", name);
      }
      window.PIKARESK?.go?.("friends");
      setPanel(false);
      return;
    }
    if (type === "product" && name) {
      localStorage.setItem("pikaresk_market_focus", name);
      window.PIKARESK?.go?.("market");
      setPanel(false);
    }
  });

  function renderNotifications(items) {
    if (!notifyList) return;
    if (!items.length) {
      notifyList.innerHTML = `<div class="header-search-empty">Bildirim yok.</div>`;
    } else {
      notifyList.innerHTML = items
        .map((item) => {
          const title = item.title || "Bildirim";
          const body = item.body || "";
          const unreadClass = item.read ? "" : "unread";
          return `
            <button class="header-notify-item ${unreadClass}" type="button" data-id="${item.id}">
              <div class="header-notify-title">${title}</div>
              ${body ? `<div class="header-notify-body">${body}</div>` : ""}
            </button>
          `;
        })
        .join("");
    }
    const unreadCount = items.filter((item) => !item.read).length;
    if (notifyBadge) {
      notifyBadge.textContent = String(unreadCount);
      notifyBadge.style.display = unreadCount > 0 ? "inline-flex" : "none";
    }
  }

  let stopNotifications = null;
  let lastNotifications = [];
  let currentUid = "";
  watchAuth((user) => {
    if (stopNotifications) {
      stopNotifications();
      stopNotifications = null;
    }
    if (!user) {
      currentUid = "";
      lastNotifications = [];
      renderNotifications([]);
      return;
    }
    currentUid = user.uid;
    stopNotifications = listenNotifications(
      user.uid,
      (items) => {
        lastNotifications = items;
        renderNotifications(items);
      },
      (error) => {
        console.warn("Notifications listener error:", error?.code || error);
      }
    );
  });

  notifyBtn?.addEventListener("click", () => setNotifyPanel(true));
  notifyPanel?.addEventListener("click", (event) => {
    const action = event.target?.getAttribute("data-action");
    if (action === "close-notify") {
      setNotifyPanel(false);
    }
  });
  notifyList?.addEventListener("click", async (event) => {
    const button = event.target.closest(".header-notify-item");
    if (!button) return;
    const id = button.getAttribute("data-id");
    const item = lastNotifications.find((entry) => entry.id === id);
    if (!item) return;
    if (!item.read) {
      await markNotificationRead(item.id);
    }
    setNotifyPanel(false);
    if (item.type === "friend_request" || item.type === "friend_accept") {
      window.PIKARESK?.go?.("friends");
      return;
    }
    if (item.type === "message") {
      window.PIKARESK?.go?.("dm");
      return;
    }
    if (item.type === "stock") {
      window.PIKARESK?.go?.("market");
    }
  });
  notifyMarkAll?.addEventListener("click", async () => {
    if (!currentUid) return;
    try {
      await markAllNotificationsRead(currentUid);
    } catch {
      // ignore
    }
  });
}
