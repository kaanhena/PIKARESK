import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { HomePage } from './pages/Home.js';
import { ProfilePage } from './pages/Profile.js';
import { ModulesPage } from './pages/Modules.js';
import { SettingsPage } from './pages/Settings.js';

const routes = {
  home: HomePage,
  profile: ProfilePage,
  modules: ModulesPage,
  settings: SettingsPage
};

export function mountApp(rootEl) {
  if (!rootEl) throw new Error('root element bulunamadı (#app).');

  const state = { view: 'home' };

  const layout = document.createElement('div');
  layout.className = 'app-shell';
  layout.innerHTML = `
    <div class="app-grid">
      <header class="app-header"></header>
      <aside class="app-sidebar"></aside>
      <main class="app-main" aria-live="polite"></main>
    </div>
  `;

  rootEl.replaceChildren(layout);

  const headerEl = layout.querySelector('.app-header');
  const sidebarEl = layout.querySelector('.app-sidebar');
  const mainEl = layout.querySelector('.app-main');

  Header(headerEl, {
    title: 'PİKAREKS',
    onLogout: () => alert('Çıkış yapma/auth daha sonra eklenecek.')
  });

  Sidebar(sidebarEl, {
    active: state.view,
    onNavigate: (next) => {
      state.view = next;
      render();
      sidebarEl.querySelectorAll('[data-nav]').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.nav === state.view);
      });
    }
  });

  function render() {
    const Page = routes[state.view] ?? HomePage;
    Page(mainEl);
  }

  render();
}
