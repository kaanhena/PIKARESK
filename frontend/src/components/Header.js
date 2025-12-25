export function Header(root, { title = "PIKARESK", onLogout } = {}) {
  root.innerHTML = `
    <header class="app-header">
      <div class="brand">${title}</div>

      <div class="header-center"></div>

      <div class="header-right">
        <div class="user-chip">
          <div class="avatar-placeholder"></div>
          <span>Kullanıcı</span>
        </div>

        <button class="icon-btn" aria-label="Bildirimler">🔔</button>

        <button class="btn btn-ghost" id="logoutBtn">Çıkış Yap</button>
      </div>
    </header>
  `;

  const btn = root.querySelector("#logoutBtn");
  btn?.addEventListener("click", () => onLogout?.());
}
