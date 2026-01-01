const STORAGE_KEY = "pikaresk_settings";

export const DEFAULT_SETTINGS = {
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
  timezone: "GMT+3"
};

let cachedSettings = { ...DEFAULT_SETTINGS };
const subscribers = new Set();

export function normalizeSettings(settings = {}) {
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

export function loadSettings() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    cachedSettings = normalizeSettings(data);
    return cachedSettings;
  } catch {
    cachedSettings = normalizeSettings({});
    return cachedSettings;
  }
}

export function getSettings() {
  return cachedSettings;
}

export function saveSettings(settings) {
  return setSettings(settings, { persist: true });
}

export function setSettings(settings, { persist = true } = {}) {
  cachedSettings = normalizeSettings(settings);
  if (persist) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedSettings));
  }
  applySettings(cachedSettings);
  subscribers.forEach((cb) => cb(cachedSettings));
  return cachedSettings;
}

export function updateSettings(partial, options) {
  return setSettings({ ...cachedSettings, ...partial }, options);
}

export function subscribeSettings(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
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
  document.body.dataset.neon = settings.neonGlow ? "on" : "off";
}

export function applyStoredSettings() {
  const settings = loadSettings();
  applySettings(settings);
  return settings;
}
