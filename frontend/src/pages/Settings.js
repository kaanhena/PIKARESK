import "./Settings.css";
import {
  deleteAccount,
  reauthenticate,
  updateAccountEmail,
  updateAccountPassword,
  updateAccountProfile,
  watchAuth,
} from "../services/authService.js";
import {
  ensureUserProfile,
  listenUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../services/userService.js";
import {
  ensureUserSettings,
  listenUserSettings,
  updateUserSettings,
  deleteUserSettings,
} from "../services/settingsService.js";
import { getSettings, setSettings, updateSettings } from "../utils/settings.js";

const TOGGLE_MAP = {
  friendRequests: "friendRequests",
  gameActivity: "gameActivity",
  onlineStatus: "onlineStatus",
  desktopNotif: "desktopNotif",
  messageSound: "messageSound",
  emailFriendRequest: "emailFriendRequest",
  emailMessages: "emailMessages",
  neonGlow: "neonGlow",
  animations: "animations",
};

export function Settings(root) {
  root.innerHTML = `
    <main class="settings-container">
      <header class="settings-header">
        <nav class="settings-nav">
          <div class="settings-menu-item active" data-section="account">
            <span class="settings-menu-item-icon">H</span>
            <span class="settings-menu-item-text">Hesabım</span>
          </div>
          <div class="settings-menu-item" data-section="profile">
            <span class="settings-menu-item-icon">P</span>
            <span class="settings-menu-item-text">Profil</span>
          </div>
          <div class="settings-menu-item" data-section="privacy">
            <span class="settings-menu-item-icon">G</span>
            <span class="settings-menu-item-text">Gizlilik &amp; Güvenlik</span>
          </div>
          <div class="settings-menu-item" data-section="appearance">
            <span class="settings-menu-item-icon">R</span>
            <span class="settings-menu-item-text">Görünüm</span>
          </div>
          <div class="settings-menu-item" data-section="notifications">
            <span class="settings-menu-item-icon">B</span>
            <span class="settings-menu-item-text">Bildirimler</span>
          </div>
          <div class="settings-menu-item" data-section="language">
            <span class="settings-menu-item-icon">D</span>
            <span class="settings-menu-item-text">Dil &amp; Bölge</span>
          </div>
        </nav>
      </header>

      <section class="settings-content" id="settingsContent">
        <div class="settings-content-section" id="account">
          <header class="settings-content-header">
            <h1>Hesabım</h1>
            <p>Hesap bilgilerinizi yönetin</p>
          </header>
          <div class="settings-section">
            <h3>Hesap Bilgileri</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Kullanıcı Adı</div>
                <input type="text" class="settings-input" id="accountDisplayName" placeholder="Kullanıcı adı">
              </div>
              <button class="settings-button-secondary settings-button" id="saveDisplayNameBtn">Kaydet</button>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">E-posta</div>
                <input type="email" class="settings-input" id="accountEmail" placeholder="ornek@email.com">
              </div>
              <button class="settings-button-secondary settings-button" id="saveEmailBtn">Kaydet</button>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Mevcut Şifre</div>
                <input type="password" class="settings-input" id="accountEmailPassword" placeholder="Şifreniz" autocomplete="current-password">
              </div>
            </div>
            <div class="settings-inline-status" id="accountStatus"></div>
          </div>
          <div class="settings-section">
            <h3>Şifre Güncelle</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Mevcut Şifre</div>
                <input type="password" class="settings-input" id="accountPasswordCurrent" placeholder="Mevcut şifre" autocomplete="current-password">
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Yeni Şifre</div>
                <input type="password" class="settings-input" id="accountPasswordNew" placeholder="Yeni şifre" autocomplete="new-password">
              </div>
              <button class="settings-button-secondary settings-button" id="savePasswordBtn">Güncelle</button>
            </div>
            <div class="settings-inline-status" id="passwordStatus"></div>
          </div>
          <div class="settings-section">
            <h3>Tehlikeli Bölge</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Hesabı Sil</div>
                <div class="settings-row-description">Hesabınızı kalıcı olarak silin</div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Mevcut Şifre</div>
                <input type="password" class="settings-input" id="deleteAccountPassword" placeholder="Şifreniz" autocomplete="current-password">
              </div>
              <button class="settings-button settings-button-danger" id="deleteAccountBtn">Hesabı Sil</button>
            </div>
            <div class="settings-inline-status" id="deleteStatus"></div>
          </div>
        </div>

        <div class="settings-content-section" id="profile" style="display: none;">
          <header class="settings-content-header">
            <h1>Profil</h1>
            <p>Profilinizi özelleştirin</p>
          </header>
          <div class="settings-section">
            <h3>Avatar</h3>
            <div class="avatar-section">
              <div class="avatar-preview" id="avatarPreview">P</div>
              <div class="avatar-actions">
                <input type="text" class="settings-input settings-input-sm" id="avatarText" maxlength="2" placeholder="HP">
                <input type="color" id="avatarColor" value="#6b5cff" />
                <button class="settings-button" id="saveAvatarBtn">Kaydet</button>
              </div>
            </div>
            <div class="settings-inline-status" id="avatarStatus"></div>
          </div>
          <div class="settings-section">
            <h3>Profil Bilgileri</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Biyografi</div>
                <input type="text" class="settings-input" id="profileBio" placeholder="Hakkında kısa bilgi">
              </div>
            </div>
          </div>
          <div class="settings-section">
            <h3>Banner Rengi</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Profil Banner'ı</div>
                <div class="settings-row-description">Profilinizde görünecek banner rengi</div>
              </div>
              <input type="color" id="bannerColor" value="#ff00e6" />
            </div>
            <div class="settings-row">
              <button class="settings-button" id="saveProfileBtn">Kaydet</button>
            </div>
            <div class="settings-inline-status" id="profileStatus"></div>
          </div>
        </div>

        <div class="settings-content-section" id="privacy" style="display: none;">
          <header class="settings-content-header">
            <h1>Gizlilik &amp; Güvenlik</h1>
            <p>Gizlilik ayarlarınızı yönetin</p>
          </header>
          <div class="settings-section">
            <h3>Kimler Mesaj Atabilir?</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Direkt Mesajlar</div>
                <div class="settings-row-description">Kimler size mesaj gönderebilir</div>
              </div>
              <select class="settings-select" data-setting="dmPrivacy">
                <option value="everyone">Herkes</option>
                <option value="friends">Sadece arkadaşlar</option>
                <option value="none">Kimse</option>
              </select>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Arkadaşlık İstekleri</div>
                <div class="settings-row-description">Arkadaşlık isteği almayı kapat</div>
              </div>
              <div class="toggle-switch" data-toggle="friendRequests">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
          </div>
          <div class="settings-section">
            <h3>Profil Görünürlüğü</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Oyun Aktivitesi</div>
                <div class="settings-row-description">Oynadığınız oyunları göster</div>
              </div>
              <div class="toggle-switch" data-toggle="gameActivity">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Online Durumu</div>
                <div class="settings-row-description">Online/Offline durumunuzu göster</div>
              </div>
              <div class="toggle-switch" data-toggle="onlineStatus">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-content-section" id="appearance" style="display: none;">
          <header class="settings-content-header">
            <h1>Görünüm</h1>
            <p>Arayüz görünümünü özelleştirin</p>
          </header>
          <div class="settings-section">
            <h3>Tema</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Renk Teması</div>
                <div class="settings-row-description">Arayüz renk şeması</div>
              </div>
              <select class="settings-select" data-setting="theme">
                <option value="neon">Karanlık (Neon)</option>
                <option value="classic">Karanlık (Klasik)</option>
                <option value="light">Aydınlık</option>
              </select>
            </div>
          </div>
          <div class="settings-section">
            <h3>Yazı Boyutu</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Font Ölçeği</div>
                <div class="settings-row-description">Yazı boyutunu ayarlayın</div>
              </div>
              <input type="range" class="settings-range" data-setting="fontScale" min="12" max="20">
            </div>
          </div>
          <div class="settings-section">
            <h3>Efektler</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Neon Parlamaları</div>
                <div class="settings-row-description">Neon glow efektlerini göster</div>
              </div>
              <div class="toggle-switch" data-toggle="neonGlow">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Animasyonlar</div>
                <div class="settings-row-description">Geçiş animasyonları</div>
              </div>
              <div class="toggle-switch" data-toggle="animations">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-content-section" id="notifications" style="display: none;">
          <header class="settings-content-header">
            <h1>Bildirimler</h1>
            <p>Bildirim tercihlerinizi yönetin</p>
          </header>
          <div class="settings-section">
            <h3>Masaüstü Bildirimleri</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Tüm Bildirimler</div>
                <div class="settings-row-description">Masaüstü bildirimlerini etkinleştir</div>
              </div>
              <div class="toggle-switch" data-toggle="desktopNotif">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
          </div>
          <div class="settings-section">
            <h3>Sesler</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Mesaj Sesi</div>
                <div class="settings-row-description">Yeni mesaj geldiğinde ses çal</div>
              </div>
              <div class="toggle-switch" data-toggle="messageSound">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Ses Seviyesi</div>
                <div class="settings-row-description">Bildirim sesi yüksekliği</div>
              </div>
              <input type="range" class="settings-range" data-setting="soundVolume" min="0" max="100">
            </div>
          </div>
          <div class="settings-section">
            <h3>E-posta Bildirimleri</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Arkadaşlık İstekleri</div>
                <div class="settings-row-description">Yeni arkadaşlık isteği e-postası</div>
              </div>
              <div class="toggle-switch" data-toggle="emailFriendRequest">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Mesajlar</div>
                <div class="settings-row-description">Mesaj geldiğinde e-posta gönder</div>
              </div>
              <div class="toggle-switch" data-toggle="emailMessages">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
          </div>
          <div class="settings-inline-status" id="notificationStatus"></div>
        </div>

        <div class="settings-content-section" id="language" style="display: none;">
          <header class="settings-content-header">
            <h1>Dil &amp; Bölge</h1>
            <p>Dil ve bölge ayarları</p>
          </header>
          <div class="settings-section">
            <h3>Dil Ayarları</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Arayüz Dili</div>
                <div class="settings-row-description">Uygulama dilini seçin</div>
              </div>
              <select class="settings-select" data-setting="language">
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
          <div class="settings-section">
            <h3>Bölge &amp; Zaman</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Saat Dilimi</div>
                <div class="settings-row-description">Tarih ve saat formatı</div>
              </div>
              <select class="settings-select" data-setting="timezone">
                <option value="GMT+3">GMT+3 (İstanbul)</option>
                <option value="UTC">GMT+0 (UTC)</option>
                <option value="GMT-5">GMT-5 (EST)</option>
              </select>
            </div>
          </div>
        </div>
      </section>
    </main>
  `;

  const menuItems = root.querySelectorAll(".settings-menu-item");
  const contentSections = root.querySelectorAll(".settings-content-section");
  const toggleSwitches = root.querySelectorAll(".toggle-switch");
  const inputs = root.querySelectorAll("[data-setting]");

  const avatarPreview = root.querySelector("#avatarPreview");
  const avatarText = root.querySelector("#avatarText");
  const avatarColor = root.querySelector("#avatarColor");
  const saveAvatarBtn = root.querySelector("#saveAvatarBtn");
  const avatarStatus = root.querySelector("#avatarStatus");

  const profileBio = root.querySelector("#profileBio");
  const bannerColor = root.querySelector("#bannerColor");
  const saveProfileBtn = root.querySelector("#saveProfileBtn");
  const profileStatus = root.querySelector("#profileStatus");

  const accountDisplayName = root.querySelector("#accountDisplayName");
  const accountEmail = root.querySelector("#accountEmail");
  const accountEmailPassword = root.querySelector("#accountEmailPassword");
  const saveDisplayNameBtn = root.querySelector("#saveDisplayNameBtn");
  const saveEmailBtn = root.querySelector("#saveEmailBtn");
  const accountStatus = root.querySelector("#accountStatus");

  const accountPasswordCurrent = root.querySelector("#accountPasswordCurrent");
  const accountPasswordNew = root.querySelector("#accountPasswordNew");
  const savePasswordBtn = root.querySelector("#savePasswordBtn");
  const passwordStatus = root.querySelector("#passwordStatus");

  const deleteAccountPassword = root.querySelector("#deleteAccountPassword");
  const deleteAccountBtn = root.querySelector("#deleteAccountBtn");
  const deleteStatus = root.querySelector("#deleteStatus");

  const notificationStatus = root.querySelector("#notificationStatus");

  let currentUser = null;
  let profile = null;
  let settings = getSettings();
  let stopProfile = null;
  let stopSettings = null;

  function setStatus(element, message, tone = "info") {
    if (!element) return;
    element.textContent = message || "";
    element.dataset.tone = tone;
  }

  function syncForm() {
    inputs.forEach((input) => {
      const key = input.dataset.setting;
      if (!key) return;
      if (input.type === "checkbox") {
        input.checked = Boolean(settings[key]);
      } else if (input.type === "range") {
        input.value = settings[key] ?? input.value;
      } else {
        input.value = settings[key] ?? input.value;
      }
    });

    toggleSwitches.forEach((toggle) => {
      const key = TOGGLE_MAP[toggle.dataset.toggle];
      if (!key) return;
      toggle.classList.toggle("active", Boolean(settings[key]));
    });
  }

  function syncProfile() {
    if (accountDisplayName) accountDisplayName.value = profile?.displayName || "";
    if (accountEmail) accountEmail.value = profile?.email || "";
    if (profileBio) profileBio.value = profile?.bio || "";
    if (bannerColor) bannerColor.value = profile?.bannerColor || "#ff00e6";
    if (avatarText) avatarText.value = profile?.avatarText || "";
    if (avatarColor) avatarColor.value = profile?.avatarColor || "#6b5cff";

    if (avatarPreview) {
      const text = (profile?.avatarText || profile?.displayName || "P").slice(0, 2).toUpperCase();
      avatarPreview.textContent = text || "P";
      avatarPreview.style.background = profile?.avatarColor || "#6b5cff";
    }
  }

  function updateAvatarPreview() {
    if (!avatarPreview) return;
    const text = (avatarText?.value || profile?.displayName || "P").slice(0, 2).toUpperCase();
    avatarPreview.textContent = text || "P";
    avatarPreview.style.background = avatarColor?.value || "#6b5cff";
  }

  function updateSetting(key, value) {
    settings = updateSettings({ [key]: value });
    if (currentUser?.uid) {
      updateUserSettings(currentUser.uid, { [key]: value }).catch(() => {});
    }
  }

  function handleDesktopNotificationToggle(nextValue) {
    if (!nextValue) return;
    if (!("Notification" in window)) {
      setStatus(notificationStatus, "Tarayıcı bildirimleri desteklemiyor.", "error");
      updateSetting("desktopNotif", false);
      return;
    }
    if (Notification.permission === "granted") return;
    Notification.requestPermission().then((result) => {
      if (result !== "granted") {
        setStatus(notificationStatus, "Bildirim izni verilmedi.", "error");
        updateSetting("desktopNotif", false);
        syncForm();
      }
    });
  }

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.getAttribute("data-section");
      menuItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      contentSections.forEach((s) => (s.style.display = "none"));
      root.querySelector(`#${section}`).style.display = "block";
    });
  });

  toggleSwitches.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const key = TOGGLE_MAP[toggle.dataset.toggle];
      if (!key) return;
      const nextValue = !toggle.classList.contains("active");
      toggle.classList.toggle("active", nextValue);
      updateSetting(key, nextValue);
      if (key === "desktopNotif") {
        handleDesktopNotificationToggle(nextValue);
      }
    });
  });

  inputs.forEach((input) => {
    const key = input.dataset.setting;
    if (!key) return;
    const handler = () => {
      const value = input.type === "range" ? Number(input.value) : input.value;
      updateSetting(key, value);
    };
    input.addEventListener("input", handler);
    input.addEventListener("change", handler);
  });

  saveAvatarBtn?.addEventListener("click", async () => {
    if (!currentUser) return;
    try {
      const updates = {
        avatarText: (avatarText?.value || "").trim().slice(0, 2).toUpperCase(),
        avatarColor: avatarColor?.value || "#6b5cff",
      };
      await updateUserProfile(currentUser.uid, updates);
      setStatus(avatarStatus, "Avatar güncellendi.", "success");
    } catch (error) {
      setStatus(avatarStatus, error?.message || "Avatar güncellenemedi.", "error");
    }
  });

  avatarText?.addEventListener("input", updateAvatarPreview);
  avatarColor?.addEventListener("input", updateAvatarPreview);

  saveProfileBtn?.addEventListener("click", async () => {
    if (!currentUser) return;
    try {
      const updates = {
        bio: (profileBio?.value || "").trim(),
        bannerColor: bannerColor?.value || "#ff00e6",
      };
      await updateUserProfile(currentUser.uid, updates);
      setStatus(profileStatus, "Profil güncellendi.", "success");
    } catch (error) {
      setStatus(profileStatus, error?.message || "Profil güncellenemedi.", "error");
    }
  });

  saveDisplayNameBtn?.addEventListener("click", async () => {
    if (!currentUser) return;
    const displayName = (accountDisplayName?.value || "").trim();
    if (!displayName) {
      setStatus(accountStatus, "Kullanıcı adı boş olamaz.", "error");
      return;
    }
    try {
      await updateAccountProfile({ displayName });
      await updateUserProfile(currentUser.uid, {
        displayName,
        displayNameLower: displayName.toLowerCase(),
      });
      setStatus(accountStatus, "Kullanıcı adı güncellendi.", "success");
    } catch (error) {
      setStatus(accountStatus, error?.message || "Kullanıcı adı güncellenemedi.", "error");
    }
  });

  saveEmailBtn?.addEventListener("click", async () => {
    if (!currentUser) return;
    const email = (accountEmail?.value || "").trim();
    const currentPassword = accountEmailPassword?.value || "";
    if (!email || !currentPassword) {
      setStatus(accountStatus, "E-posta ve mevcut şifre gerekli.", "error");
      return;
    }
    try {
      await updateAccountEmail(email, currentPassword);
      await updateUserProfile(currentUser.uid, {
        email,
        emailLower: email.toLowerCase(),
      });
      accountEmailPassword.value = "";
      setStatus(accountStatus, "E-posta güncellendi.", "success");
    } catch (error) {
      setStatus(accountStatus, error?.message || "E-posta güncellenemedi.", "error");
    }
  });

  savePasswordBtn?.addEventListener("click", async () => {
    if (!currentUser) return;
    const currentPassword = accountPasswordCurrent?.value || "";
    const newPassword = accountPasswordNew?.value || "";
    if (!currentPassword || !newPassword) {
      setStatus(passwordStatus, "Mevcut ve yeni şifre gerekli.", "error");
      return;
    }
    try {
      await updateAccountPassword(newPassword, currentPassword);
      accountPasswordCurrent.value = "";
      accountPasswordNew.value = "";
      setStatus(passwordStatus, "Şifre güncellendi.", "success");
    } catch (error) {
      setStatus(passwordStatus, error?.message || "Şifre güncellenemedi.", "error");
    }
  });

  deleteAccountBtn?.addEventListener("click", async () => {
    if (!currentUser) return;
    const currentPassword = deleteAccountPassword?.value || "";
    if (!currentPassword) {
      setStatus(deleteStatus, "Hesap silmek için şifre gerekli.", "error");
      return;
    }
    const confirmed = window.confirm("Hesabınız kalıcı olarak silinecek. Emin misiniz?");
    if (!confirmed) return;
    try {
      await reauthenticate(currentPassword);
      await deleteUserProfile(currentUser.uid);
      await deleteUserSettings(currentUser.uid);
      await deleteAccount();
      setStatus(deleteStatus, "Hesap silindi.", "success");
      window.PIKARESK?.go?.("login");
    } catch (error) {
      setStatus(deleteStatus, error?.message || "Hesap silinemedi.", "error");
    }
  });

  syncForm();
  syncProfile();

  watchAuth((user) => {
    currentUser = user;
    if (stopProfile) stopProfile();
    if (stopSettings) stopSettings();
    if (!user) {
      profile = null;
      settings = getSettings();
      syncForm();
      syncProfile();
      return;
    }

    ensureUserProfile(user).catch(() => {});
    ensureUserSettings(user.uid).catch(() => {});

    stopProfile = listenUserProfile(
      user.uid,
      (nextProfile) => {
        profile = nextProfile || profile;
        syncProfile();
      },
      () => {}
    );

    stopSettings = listenUserSettings(
      user.uid,
      (nextSettings) => {
        settings = setSettings(nextSettings, { persist: true });
        syncForm();
      },
      () => {}
    );
  });
}
