const items = [
  { key: 'home', label: 'Ana Sayfa' },
  { key: 'profile', label: 'Profil' },
  { key: 'modules', label: 'Modüller' },
  { key: 'settings', label: 'Ayarlar' }
];

export function Sidebar(root, { active = 'home', onNavigate } = {}) {
  root.innerHTML = `
    <nav class="nav" aria-label="Sol menü">
      ${items.map(i => `
        <button class="nav-btn ${i.key === active ? 'is-active' : ''}" type="button" data-nav="${i.key}">
          ${i.label}
        </button>
      `).join('')}
    </nav>
  `;
  root.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => onNavigate?.(btn.dataset.nav));
  });
}
