export function Header(root, { title = "PIKARESK", onLogout } = {}) {
  root.innerHTML = `
    <header class="app-header main-header">
      <div class="header-logo">
        <div class="logo-icon">
          <span class="logo-icon-text">P</span>
        </div>
        <div class="logo-text">
          <div class="logo-title">${title}</div>
          <div class="logo-subtitle">Gaming Community</div>
        </div>
      </div>

      <div class="header-actions">
        <button class="search-btn" type="button" aria-label="Arama">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 3a8 8 0 1 1 0 16a8 8 0 0 1 0-16m0 2a6 6 0 1 0 0 12a6 6 0 0 0 0-12m9.7 14.3l-3.4-3.4a1 1 0 0 0-1.4 1.4l3.4 3.4a1 1 0 0 0 1.4-1.4z"/>
          </svg>
        </button>
        <button class="notification-btn" type="button" aria-label="Bildirimler">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a5 5 0 0 1 5 5v2.7l1.3 2.6A2 2 0 0 1 16.5 16H7.5a2 2 0 0 1-1.8-2.7L7 10.7V8a5 5 0 0 1 5-5zm0 18a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 21z"/>
          </svg>
          <span class="notification-badge">5</span>
        </button>

        <div class="user-profile" role="button" tabindex="0">
          <span class="user-name">Kullanici</span>
          <div class="user-avatar">
            K
            <span class="status-indicator" aria-hidden="true"></span>
          </div>
        </div>

        <button class="btn btn-ghost" id="logoutBtn" type="button">Cikis</button>
      </div>
    </header>
  `;
  const btn = root.querySelector("#logoutBtn");
  btn?.addEventListener("click", () => onLogout?.());
}
