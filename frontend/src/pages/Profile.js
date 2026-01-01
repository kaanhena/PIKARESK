import "./Profile.css";
import { watchAuth } from "../services/authService.js";
import { listenUserProfile } from "../services/userService.js";

export function Profile(root) {
  root.innerHTML = `
    <section class="profile-page">
      <div class="profile-wrapper">
        <article class="profile-card">
          <div class="profile-avatar-wrapper">
            <div class="profile-avatar" id="profileAvatar">--</div>
            <div class="online-status" aria-label="Çevrimiçi"></div>
          </div>
          <div class="profile-info">
            <h1 class="profile-username" id="username">Kullanıcı</h1>
            <p class="profile-title" id="userTitle">⚔️ Oyuncu</p>
            <p class="profile-bio" id="userBio">Henüz biyografi yok.</p>
            <div class="profile-badges">
              <span class="badge badge-premium">👑 Premium</span>
              <span class="badge badge-verified">✓ Doğrulanmış</span>
              <span class="badge badge-pro">⭐ Pro</span>
              <span class="badge badge-vip">💎 VIP</span>
            </div>
          </div>
        </article>

        <section class="balance-section">
          <article class="balance-card">
            <div class="balance-header">
              <div class="balance-icon pp-icon">⚡</div>
              <p class="balance-label">Pika Point</p>
            </div>
            <h2 class="balance-amount" id="pikaPoint">0<span class="balance-currency">PP</span></h2>
            <div class="balance-action">
              <button class="balance-btn" id="buyPpBtn" type="button">PP Satın Al</button>
            </div>
          </article>
          <article class="balance-card">
            <div class="balance-header">
              <div class="balance-icon tl-icon">₺</div>
              <p class="balance-label">TL Bakiye</p>
            </div>
            <h2 class="balance-amount" id="tlBalance">0,00<span class="balance-currency">₺</span></h2>
            <div class="balance-action">
              <button class="balance-btn" id="topupBtn" type="button">Bakiye Yükle</button>
            </div>
          </article>
        </section>

        <section class="referral-section">
          <div class="referral-card">
            <div class="referral-icon-wrapper">
              <div class="referral-icon">🎁</div>
            </div>
            <div class="referral-content">
              <h2 class="referral-title">Davet Et &amp; Kazan</h2>
              <p class="referral-description">
                Arkadaşlarını siteye davet et, her davet için <span id="referralReward">50 PP</span> kazan!
              </p>
              <div class="referral-stats">
                <div class="referral-stat-item">
                  <div class="referral-stat-icon">👥</div>
                  <div class="referral-stat-content">
                    <p class="referral-stat-label">Davet Edilenler</p>
                    <p class="referral-stat-value" id="referralCount">0 Kişi</p>
                  </div>
                </div>
                <div class="referral-stat-item">
                  <div class="referral-stat-icon">💰</div>
                  <div class="referral-stat-content">
                    <p class="referral-stat-label">Kazandığın PP</p>
                    <p class="referral-stat-value" id="referralEarned">0 PP</p>
                  </div>
                </div>
              </div>
              <div class="referral-code-section">
                <label for="referralCodeInput" class="referral-code-label">Senin Davet Kodun</label>
                <div class="referral-code-box">
                  <input type="text" id="referralCodeInput" class="referral-code-input" value="PIKA" readonly>
                  <button class="referral-copy-btn" id="copyReferralBtn" type="button">
                    <span id="copyIcon">📋</span>
                    <span id="copyText">Kopyala</span>
                  </button>
                </div>
              </div>
              <div class="referral-actions">
                <button class="referral-share-btn" id="shareReferralBtn" type="button">
                  🔗 Davet Linki Paylaş
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="transaction-section">
          <div class="transaction-card">
            <div class="transaction-header-section">
              <h2 class="transaction-title">📊 İşlem Geçmişi</h2>
              <p class="transaction-subtitle">Son PP ve TL hareketlerin</p>
            </div>
            <div class="transaction-list" id="transactionList">
              <div class="transaction-item transaction-positive">
                <div class="transaction-icon-box positive"><span class="transaction-icon">⬇️</span></div>
                <div class="transaction-details">
                  <p class="transaction-name">PP Satın Alma</p>
                  <p class="transaction-date">-</p>
                </div>
                <div class="transaction-amount positive"><span class="transaction-value">+0 PP</span></div>
              </div>
            </div>
            <div class="transaction-footer">
              <button class="transaction-view-all" id="viewAllTxBtn" type="button">Tümünü Görüntüle →</button>
            </div>
          </div>
        </section>
      </div>
    </section>
  `;

  const profileAvatar = root.querySelector("#profileAvatar");
  const username = root.querySelector("#username");
  const userTitle = root.querySelector("#userTitle");
  const userBio = root.querySelector("#userBio");
  const pikaPoint = root.querySelector("#pikaPoint");
  const tlBalance = root.querySelector("#tlBalance");
  const referralCodeInput = root.querySelector("#referralCodeInput");
  const referralCount = root.querySelector("#referralCount");
  const referralReward = root.querySelector("#referralReward");
  const referralEarned = root.querySelector("#referralEarned");
  const copyReferralBtn = root.querySelector("#copyReferralBtn");
  const copyIcon = root.querySelector("#copyIcon");
  const copyText = root.querySelector("#copyText");

  const buyPpBtn = root.querySelector("#buyPpBtn");
  const topupBtn = root.querySelector("#topupBtn");
  const shareReferralBtn = root.querySelector("#shareReferralBtn");
  const viewAllTxBtn = root.querySelector("#viewAllTxBtn");

  let stopProfile = null;

  function showToast(message) {
    const existingToast = document.querySelector(".toast-message");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  function updateReferralTotals(countValue, rewardValue) {
    const count = Number(countValue || 0);
    const reward = Number(rewardValue || 0);
    referralEarned.textContent = `${count * reward} PP`;
  }

  function applyProfile(profile, user) {
    const name = profile?.displayName || user?.displayName || user?.email || "Kullanıcı";
    const bio = profile?.bio || "Henüz biyografi yok.";
    const avatarText = (profile?.avatarText || name).slice(0, 2).toUpperCase();
    const avatarColor = profile?.avatarColor || "#667eea";
    const bannerColor = profile?.bannerColor || "#667eea";

    username.textContent = name;
    userTitle.textContent = "⚔️ Oyuncu";
    userBio.textContent = bio;
    profileAvatar.textContent = avatarText || "P";
    profileAvatar.style.background = `linear-gradient(135deg, ${avatarColor} 0%, #764ba2 100%)`;

    const usernameEl = root.querySelector(".profile-username");
    if (usernameEl) {
      usernameEl.style.background = `linear-gradient(135deg, ${bannerColor} 0%, #764ba2 100%)`;
      usernameEl.style.webkitBackgroundClip = "text";
      usernameEl.style.webkitTextFillColor = "transparent";
      usernameEl.style.backgroundClip = "text";
    }
  }

  function applyReferralDefaults() {
    referralCodeInput.value = "PIKA";
    referralCount.textContent = "0 Kişi";
    referralReward.textContent = "50 PP";
    updateReferralTotals(0, 50);
  }

  copyReferralBtn?.addEventListener("click", () => {
    referralCodeInput.select();
    referralCodeInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(referralCodeInput.value).then(
      () => {
        copyIcon.textContent = "✓";
        copyText.textContent = "Kopyalandı!";
        setTimeout(() => {
          copyIcon.textContent = "📋";
          copyText.textContent = "Kopyala";
        }, 2000);
      },
      () => {
        showToast("Kopyalanamadı.");
      }
    );
  });

  buyPpBtn?.addEventListener("click", () => showToast("PP satın alma sayfası açılacak"));
  topupBtn?.addEventListener("click", () => showToast("Bakiye yükleme sayfası açılacak"));
  shareReferralBtn?.addEventListener("click", () => showToast("Paylaşım menüsü açılacak"));
  viewAllTxBtn?.addEventListener("click", () => showToast("Tüm işlem geçmişi sayfası açılacak"));

  applyReferralDefaults();

  watchAuth((user) => {
    if (stopProfile) {
      stopProfile();
      stopProfile = null;
    }
    if (!user) {
      username.textContent = "Kullanıcı";
      userBio.textContent = "Henüz biyografi yok.";
      return;
    }
    stopProfile = listenUserProfile(user.uid, (profile) => {
      applyProfile(profile, user);
    });
  });
}