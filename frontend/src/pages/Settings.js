// src/pages/Settings.js

import "./Settings.css";
import { applySettings, loadSettings, saveSettings } from "../utils/settings.js";

const TOGGLE_MAP = {
  "2fa": "twoFactor",
  friendRequests: "friendRequests",
  gameActivity: "gameActivity",
  onlineStatus: "onlineStatus",
  desktopNotif: "desktopNotif",
  messageSound: "messageSound",
  emailFriendRequest: "emailFriendRequest",
  emailMessages: "emailMessages",
  neonGlow: "neonGlow",
  animations: "animations",
  showFPS: "showFPS",
  showPing: "showPing",
  richPresence: "richPresence",
  overlayEnabled: "overlayEnabled",
  overlayNotifications: "overlayNotifications"
};

export function Settings(root) {
  root.innerHTML = `
    <main class="settings-container">
      <header class="settings-header">
        <nav class="settings-nav">
          <div class="settings-menu-item active" data-section="account">
            <span class="settings-menu-item-icon">👤</span>
            <span class="settings-menu-item-text">Hesabım</span>
          </div>
          <div class="settings-menu-item" data-section="profile">
            <span class="settings-menu-item-icon">✏️</span>
            <span class="settings-menu-item-text">Profil</span>
          </div>
          <div class="settings-menu-item" data-section="privacy">
            <span class="settings-menu-item-icon">🔒</span>
            <span class="settings-menu-item-text">Gizlilik &amp; Güvenlik</span>
          </div>
          <div class="settings-menu-item" data-section="appearance">
            <span class="settings-menu-item-icon">🎨</span>
            <span class="settings-menu-item-text">Görünüm</span>
          </div>
          <div class="settings-menu-item" data-section="notifications">
            <span class="settings-menu-item-icon">🔔</span>
            <span class="settings-menu-item-text">Bildirimler</span>
          </div>
          <div class="settings-menu-item" data-section="language">
            <span class="settings-menu-item-icon">🌐</span>
            <span class="settings-menu-item-text">Dil &amp; Bölge</span>
          </div>
          <div class="settings-menu-item" data-section="game">
            <span class="settings-menu-item-icon">🎮</span>
            <span class="settings-menu-item-text">Oyun İçi</span>
          </div>
          <div class="settings-menu-item" data-section="overlay">
            <span class="settings-menu-item-icon">📱</span>
            <span class="settings-menu-item-text">Overlay</span>
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
                <div class="settings-row-description">Pikaresk#1234</div>
              </div>
              <button class="settings-button-secondary settings-button">Değiştir</button>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">E-posta</div>
                <div class="settings-row-description">user@pikaresk.com</div>
              </div>
              <button class="settings-button-secondary settings-button">Değiştir</button>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Şifre</div>
                <div class="settings-row-description">••••••••</div>
              </div>
              <button class="settings-button-secondary settings-button">Değiştir</button>
            </div>
          </div>
          <div class="settings-section">
            <h3>İki Faktörlü Kimlik Doğrulama</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">2FA Durumu</div>
                <div class="settings-row-description">Hesabınızı daha güvenli hale getirin</div>
              </div>
              <div class="toggle-switch" data-toggle="2fa">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
          </div>
          <div class="settings-section">
            <h3>Tehlikeli Bölge</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Hesabı Sil</div>
                <div class="settings-row-description">Hesabınızı kalıcı olarak silin</div>
              </div>
              <button class="settings-button settings-button-danger">Hesabı Sil</button>
            </div>
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
                <button class="settings-button">Avatar Değiştir</button>
                <button class="settings-button-secondary settings-button">Kaldır</button>
              </div>
            </div>
          </div>
          <div class="settings-section">
            <h3>Profil Bilgileri</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Görünen Ad</div>
                <input type="text" class="settings-input" data-setting="displayName" placeholder="Görünen adınız" value="PikaBoy">
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Biyografi</div>
                <input type="text" class="settings-input" data-setting="bio" placeholder="Hakkında kısa bilgi" value="Oyun oynamayı seven bir geliştirici">
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
              <input type="color" data-setting="bannerColor" value="#ff00e6" style="width: 60px; height: 40px; border: 2px solid rgba(0, 255, 255, 0.3); border-radius: 8px; cursor: pointer; background: transparent;">
            </div>
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
                <option value="friends" selected>Sadece Arkadaşlar</option>
                <option value="none">Kimse</option>
              </select>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Arkadaşlık İstekleri</div>
                <div class="settings-row-description">Arkadaşlık isteği almayı kapat</div>
              </div>
              <div class="toggle-switch active" data-toggle="friendRequests">
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
              <div class="toggle-switch active" data-toggle="gameActivity">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Online Durumu</div>
                <div class="settings-row-description">Online/Offline durumunuzu göster</div>
              </div>
              <div class="toggle-switch active" data-toggle="onlineStatus">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
          </div>
          <div class="settings-section">
            <h3>Veri &amp; Gizlilik</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Veri Kullanımı</div>
                <div class="settings-row-description">Verilerinizin nasıl kullanıldığını görün</div>
              </div>
              <button class="settings-button-secondary settings-button">İncele</button>
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
                <option value="neon" selected>Karanlık (Neon)</option>
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
              <input type="range" class="settings-range" data-setting="fontScale" min="12" max="20" value="16">
            </div>
          </div>
          <div class="settings-section">
            <h3>Efektler</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Neon Parlamaları</div>
                <div class="settings-row-description">Neon glow efektlerini göster</div>
              </div>
              <div class="toggle-switch active" data-toggle="neonGlow">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Animasyonlar</div>
                <div class="settings-row-description">Geçiş animasyonları</div>
              </div>
              <div class="toggle-switch active" data-toggle="animations">
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
              <div class="toggle-switch active" data-toggle="desktopNotif">
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
              <div class="toggle-switch active" data-toggle="messageSound">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Ses Seviyesi</div>
                <div class="settings-row-description">Bildirim sesi yüksekliği</div>
              </div>
              <input type="range" class="settings-range" data-setting="soundVolume" min="0" max="100" value="70">
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
                <option value="tr" selected>Türkçe</option>
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
                <option value="GMT+3" selected>GMT+3 (İstanbul)</option>
                <option value="UTC">GMT+0 (UTC)</option>
                <option value="GMT-5">GMT-5 (EST)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-content-section" id="game" style="display: none;">
          <header class="settings-content-header">
            <h1>Oyun İçi Ayarlar</h1>
            <p>Oyun deneyiminizi optimize edin</p>
          </header>
          <div class="settings-section">
            <h3>Performans</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">FPS Göstergesi</div>
                <div class="settings-row-description">Ekranda FPS göster</div>
              </div>
              <div class="toggle-switch active" data-toggle="showFPS">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Ping Göstergesi</div>
                <div class="settings-row-description">Ağ gecikmesini göster</div>
              </div>
              <div class="toggle-switch active" data-toggle="showPing">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
          </div>
          <div class="settings-section">
            <h3>Oyun Aktivitesi</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Zengin Durum</div>
                <div class="settings-row-description">Oynadığınız oyunu arkadaşlarınıza göster</div>
              </div>
              <div class="toggle-switch active" data-toggle="richPresence">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-content-section" id="overlay" style="display: none;">
          <header class="settings-content-header">
            <h1>Overlay Ayarları</h1>
            <p>Oyun içi overlay'i özelleştirin</p>
          </header>
          <div class="settings-section">
            <h3>Overlay</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Overlay Etkin</div>
                <div class="settings-row-description">Oyun içinde overlay göster</div>
              </div>
              <div class="toggle-switch active" data-toggle="overlayEnabled">
                <div class="toggle-switch-knob"></div>
              </div>
            </div>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Overlay Pozisyonu</div>
                <div class="settings-row-description">Ekrandaki konumu</div>
              </div>
              <select class="settings-select" data-setting="overlayPosition">
                <option value="top-left">Sol Üst</option>
                <option value="top-right" selected>Sağ Üst</option>
                <option value="bottom-left">Sol Alt</option>
                <option value="bottom-right">Sağ Alt</option>
              </select>
            </div>
          </div>
          <div class="settings-section">
            <h3>Bildirimler</h3>
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-title">Mesaj Bildirimleri</div>
                <div class="settings-row-description">Oyun içinde mesaj bildirimi göster</div>
              </div>
              <div class="toggle-switch active" data-toggle="overlayNotifications">
                <div class="toggle-switch-knob"></div>
              </div>
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

  const settings = loadSettings();
  applySettings(settings);

  function syncForm() {
    inputs.forEach((input) => {
      const key = input.dataset.setting;
      if (!key) return;
      if (input.type === "checkbox") {
        input.checked = Boolean(settings[key]);
      } else {
        input.value = settings[key] ?? input.value;
      }
    });

    toggleSwitches.forEach((toggle) => {
      const key = TOGGLE_MAP[toggle.dataset.toggle];
      if (!key) return;
      toggle.classList.toggle("active", Boolean(settings[key]));
    });

    if (avatarPreview) {
      const color = settings.bannerColor || "#ff00e6";
      avatarPreview.style.background = `linear-gradient(135deg, ${color}, #00ffff)`;
    }
  }

  function updateSetting(key, value) {
    settings[key] = value;
    saveSettings(settings);
    applySettings(settings);
    if (key === "bannerColor" && avatarPreview) {
      avatarPreview.style.background = `linear-gradient(135deg, ${value}, #00ffff)`;
    }
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
      toggle.classList.toggle("active");
      updateSetting(key, toggle.classList.contains("active"));
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

  syncForm();
}
