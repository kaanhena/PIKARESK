const STORAGE_KEY = "pikaresk_settings";

const DEFAULT_SETTINGS = {
  displayName: "PikaBoy",
  bio: "Oyun oynamayi seven bir gelistirici",
  bannerColor: "#ff00e6",
  theme: "neon",
  fontScale: 16,
  neonGlow: true,
  animations: true,
  dmPrivacy: "friends",
  friendRequests: true,
  gameActivity: true,
  onlineStatus: true,
  desktopNotif: true,
  messageSound: true,
  soundVolume: 70,
  emailFriendRequest: false,
  emailMessages: false,
  language: "tr",
  timezone: "GMT+3",
  showFPS: true,
  showPing: true,
  richPresence: true,
  overlayEnabled: true,
  overlayPosition: "top-right",
  overlayNotifications: true,
  twoFactor: false
};

export function loadSettings() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...DEFAULT_SETTINGS, ...data };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function applySettings(settings) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = settings.language || "tr";
  document.documentElement.style.setProperty(
    "--pikaresk-font-size",
    `${settings.fontScale || 16}px`
  );
  document.body.dataset.theme = settings.theme || "neon";
  document.body.classList.toggle("no-animations", !settings.animations);
}

export function applyStoredSettings() {
  const settings = loadSettings();
  applySettings(settings);
  return settings;
}
