import "./styles/app.css";
import { Header } from "./components/Header.js";

import { HomePage } from "./pages/Home.js";
import { FriendsPage, initializeFriendsPage } from "./pages/Friends/Friends.js";
import { ProfilePage } from "./pages/Profile.js";
import { SettingsPage } from "./pages/Settings.js";

/* HEADER */
Header(document.getElementById("header-root"), {
  title: "PIKARESK",
  onLogout: () => alert("Çıkış yapıldı (demo)")
});

/* LAYOUT */
document.getElementById("app").innerHTML = `
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-title">Menü</div>
      <nav class="sidebar-nav">
        <button class="sidebar-item active" data-page="home">Ana Sayfa</button>
        <button class="sidebar-item" data-page="friends">Arkadaşlar</button>
        <button class="sidebar-item" data-page="profile">Profil</button>
        <button class="sidebar-item" data-page="settings">Ayarlar</button>
      </nav>
    </aside>
    <main class="content" id="content-area"></main>
  </div>
`;

/* PAGE MAP */
const pages = {
  home: HomePage,
  friends: FriendsPage,
  profile: ProfilePage,
  settings: SettingsPage
};

/* INIT */
const contentArea = document.getElementById("content-area");
contentArea.innerHTML = HomePage();

/* NAV */
document.querySelectorAll(".sidebar-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sidebar-item")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const page = btn.dataset.page;
    contentArea.innerHTML = pages[page]();
    
    // Friends sayfasına geçince initialize et
    if (page === 'friends') {
      initializeFriendsPage();
    }
  });
});