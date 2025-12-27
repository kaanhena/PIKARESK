// src/main.js
import "./styles/app.css";

import { Header } from "./components/Header.js";
import { Sidebar } from "./components/Sidebar.js";
import { routes } from "./routes/routes.js";

/* ROOTS */
const headerRoot = document.getElementById("header-root");
const appRoot = document.getElementById("app");

/* HEADER */
Header(headerRoot, { title: "PIKARESK" });

/* LAYOUT */
appRoot.innerHTML = `
  <div style="display:flex; min-height:100vh;">
    <div id="sidebar-root"></div>
    <main id="page-root" style="flex:1; padding:24px;"></main>
  </div>
`;

const sidebarRoot = document.getElementById("sidebar-root");
const pageRoot = document.getElementById("page-root");

/* RENDER */
function renderPage(key) {
  const route = routes[key] || routes.home;

  pageRoot.innerHTML = "";
  route.page(pageRoot);

  Sidebar(sidebarRoot, {
    active: key,
    onNavigate: renderPage
  });
}

/* DEFAULT */
renderPage("home");

/* GLOBAL (opsiyonel) */
window.PIKARESK = {
  go: renderPage
};
