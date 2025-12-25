export function Header(root, { title, onLogout } = {}) {
  root.innerHTML = `
    <div class="header-inner">
      <div class="brand" aria-label="Uygulama adı">${title ?? 'PİKAREKS'}</div>
      <button class="btn" type="button" id="logoutBtn">Çıkış Yap</button>
    </div>
  `;
  const btn = root.querySelector('#logoutBtn');
  btn?.addEventListener('click', () => onLogout?.());
}
