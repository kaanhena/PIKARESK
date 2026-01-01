// src/main.js
import "./styles/app.css";

import { applyStoredSettings, getSettings, setSettings, subscribeSettings } from "./utils/settings.js";

import { Header } from "./components/Header.js";
import { Sidebar } from "./components/Sidebar.js";
import { routes } from "./routes/routes.js";
import { logout, watchAuth } from "./services/authService.js";
import { ensureUserProfile, listenUserProfile } from "./services/userService.js";
import { ensureUserSettings, listenUserSettings } from "./services/settingsService.js";
import { listenNotifications } from "./services/notificationService.js";
import { listenUserMessages } from "./services/messageService.js";

const AUTH_KEY = "pikaresk_auth";
let currentRoute = "home";
let settings = applyStoredSettings();
let stopProfile = null;
let stopSettings = null;
let stopNotifications = null;
let stopMessages = null;
let seenNotificationIds = new Set();
let seenMessageIds = new Set();

subscribeSettings((nextSettings) => {
  settings = nextSettings;
});

/* ROOT */
const appRoot = document.getElementById("app");

/* LAYOUT */
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

function updateHeaderUser(user, profile) {
  const nameEl = headerRoot.querySelector("[data-user-name]");
  const initialEl = headerRoot.querySelector("[data-user-initial]");
  const avatarEl = headerRoot.querySelector(".user-avatar");
  if (!nameEl || !initialEl) return;
  const displayName = profile?.displayName?.trim() || user?.displayName?.trim();
  const email = profile?.email?.trim() || user?.email?.trim();
  const avatarText = profile?.avatarText?.trim();
  const avatarColor = profile?.avatarColor?.trim();
  const label = displayName || email || "Kullanıcı";
  nameEl.textContent = label;
  initialEl.textContent = (avatarText || label[0] || "K").toUpperCase();
  if (avatarEl && avatarColor) {
    avatarEl.style.background = avatarColor;
  } else if (avatarEl) {
    avatarEl.style.background = "";
  }
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
    ensureUserProfile(user).catch(() => {});
    ensureUserSettings(user.uid).catch(() => {});

    if (stopProfile) stopProfile();
    stopProfile = listenUserProfile(user.uid, (profile) => {
      updateHeaderUser(user, profile);
    });

    if (stopSettings) stopSettings();
    stopSettings = listenUserSettings(user.uid, (nextSettings) => {
      settings = setSettings(nextSettings, { persist: true });
    });

    if (stopNotifications) stopNotifications();
    stopNotifications = listenNotifications(
      user.uid,
      (items) => handleIncomingNotifications(items, user.uid),
      () => {}
    );

    if (stopMessages) stopMessages();
    stopMessages = listenUserMessages(
      user.uid,
      (items) => handleIncomingMessages(items, user.uid),
      () => {}
    );

    if (currentRoute === "login" || currentRoute === "register") {
      renderPage("home");
      return;
    }
    renderPage(currentRoute);
    return;
  }
  localStorage.removeItem(AUTH_KEY);
  updateHeaderUser(null);
  if (stopProfile) stopProfile();
  if (stopSettings) stopSettings();
  if (stopNotifications) stopNotifications();
  if (stopMessages) stopMessages();
  stopProfile = null;
  stopSettings = null;
  stopNotifications = null;
  stopMessages = null;
  seenNotificationIds = new Set();
  seenMessageIds = new Set();
  if (currentRoute !== "login" && currentRoute !== "register") {
    renderPage("login");
  }
});

function handleIncomingNotifications(items, uid) {
  const ids = new Set(items.map((item) => item.id));
  if (seenNotificationIds.size === 0) {
    seenNotificationIds = ids;
    return;
  }
  items.forEach((item) => {
    if (!seenNotificationIds.has(item.id) && item.toUid === uid) {
      if (!item.read) {
        maybeShowDesktopNotification(item.title || "Bildirim", item.body || "");
        playAlertSound();
      }
    }
  });
  seenNotificationIds = ids;
}

function handleIncomingMessages(items, uid) {
  const ids = new Set(items.map((item) => item.id));
  if (seenMessageIds.size === 0) {
    seenMessageIds = ids;
    return;
  }
  items.forEach((item) => {
    if (!seenMessageIds.has(item.id) && item.toUid === uid) {
      maybeShowDesktopNotification("Yeni mesaj", item.text || "Yeni mesaj geldi");
      playAlertSound();
    }
  });
  seenMessageIds = ids;
}

function maybeShowDesktopNotification(title, body) {
  if (!settings?.desktopNotif) return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch {
    // ignore notification errors
  }
}

function playAlertSound() {
  if (!settings?.messageSound) return;
  try {
    const volume = Math.max(0, Math.min(1, (settings.soundVolume || 70) / 100));
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const now = ctx.currentTime;
    oscillator.type = "sine";
    overtone.type = "sine";
    oscillator.frequency.value = 520;
    overtone.frequency.value = 740;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    oscillator.connect(gainNode);
    overtone.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(now);
    overtone.start(now + 0.02);
    oscillator.stop(now + 0.45);
    overtone.stop(now + 0.45);
    oscillator.onended = () => ctx.close();
  } catch {
    // ignore audio errors
  }
}