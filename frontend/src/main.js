// src/main.js
import "./styles/app.css";

import { applyStoredSettings } from "./utils/settings.js";

import { Header } from "./components/Header.js";
import { Sidebar } from "./components/Sidebar.js";
import { routes } from "./routes/routes.js";
import { logout, watchAuth } from "./services/authService.js";

const AUTH_KEY = "pikaresk_auth";
let currentRoute = "home";

applyStoredSettings();

/* ROOT */
const appRoot = document.getElementById("app");

/* LAYOUT – TEK KEZ OLUŞTUR */
appRoot.innerHTML = `
  <div style="display:flex; flex-direction:column; height:100vh;">
    <div id="header-root"></div>
    <div style="display:flex; flex:1; min-height:0;">
      <div id="sidebar-root"></div>
      <main id="page-root" style="flex:1; min-height:0;"></main>
    </div>
  </div>
`;

/* ROOT ELEMENTS */
const headerRoot = document.getElementById("header-root");
const sidebarRoot = document.getElementById("sidebar-root");
const pageRoot = document.getElementById("page-root");

/* HEADER */
Header(headerRoot, {
  title: "PIKARESK",
  onLogout: async () => {
    await logout();
    localStorage.removeItem(AUTH_KEY);
    renderPage("login");
  }
});

function updateHeaderUser(user) {
  const nameEl = headerRoot.querySelector("[data-user-name]");
  const initialEl = headerRoot.querySelector("[data-user-initial]");
  if (!nameEl || !initialEl) return;
  const displayName = user?.displayName?.trim();
  const email = user?.email?.trim();
  const label = displayName || email || "Kullanıcı";
  nameEl.textContent = label;
  initialEl.textContent = label[0]?.toUpperCase() || "K";
}

/* RENDER */
function renderPage(key) {
  const isAuthed = localStorage.getItem(AUTH_KEY) === "1";
  const safeKey = key || currentRoute || "home";
  const targetKey = isAuthed || safeKey === "login" || safeKey === "register" ? safeKey : "login";
  const route = routes[targetKey] || routes.home;
  currentRoute = targetKey;

  const isAuthPage = targetKey === "login" || targetKey === "register";
  headerRoot.style.display = isAuthPage ? "none" : "";
  sidebarRoot.style.display = isAuthPage ? "none" : "";
  appRoot.classList.toggle("has-header", !isAuthPage);

  pageRoot.innerHTML = "";
  pageRoot.scrollTop = 0;
  window.scrollTo(0, 0);
  route.page(pageRoot);

  const searchPanel = document.getElementById("headerSearchPanel");
  if (searchPanel) {
    searchPanel.classList.remove("is-open");
    searchPanel.setAttribute("aria-hidden", "true");
  }

  if (!isAuthPage) {
    Sidebar(sidebarRoot, {
      active: targetKey,
      onNavigate: renderPage
    });
  }
}

/* DEFAULT */
renderPage("home");

/* GLOBAL */
window.PIKARESK = {
  go: renderPage
};

watchAuth((user) => {
  if (user) {
    localStorage.setItem(AUTH_KEY, "1");
    updateHeaderUser(user);
    if (currentRoute === "login" || currentRoute === "register") {
      renderPage("home");
      return;
    }
    renderPage(currentRoute);
    return;
  }
  localStorage.removeItem(AUTH_KEY);
  updateHeaderUser(null);
  if (currentRoute !== "login" && currentRoute !== "register") {
    renderPage("login");
  }
});
