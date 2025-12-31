// src/pages/Home.js
import "./Home.css";
import { fetchUserCount } from "../services/userService.js";

export function Home(root) {
  const fallbackCount = getUserCount();
  const formattedUserCount = formatNumber(fallbackCount);

  root.innerHTML = `
    <section class="home-content">
      <div class="hero-premium">
        <div class="hero-background"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <span>✨</span>
            <span>Premium Dijital Ürünler</span>
          </div>
          <h1 class="hero-title">Oyun Dünyasına Hoş Geldin!</h1>
          <p class="hero-description">
            En popüler oyunlar, streaming platformları ve dijital ürünler için güvenli ve
            hızlı alışveriş deneyimi. Binlerce üründen hemen seç, anında teslim al!
          </p>
          <div class="hero-actions">
            <button class="hero-btn hero-btn-primary" type="button" data-action="go-market">
              <span>🛍️</span>
              <span>Market'i Keşfet</span>
            </button>
            <button class="hero-btn hero-btn-secondary" type="button">
              <span>🎮</span>
              <span>Popüler Oyunlar</span>
            </button>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value" data-stat="user-count">${formattedUserCount}</div>
            <div class="stat-label">Mutlu Kullanıcı</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-value">150K+</div>
            <div class="stat-label">Tamamlanan Sipariş</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-value">%99.8</div>
            <div class="stat-label">Başarı Oranı</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">7/24</div>
            <div class="stat-label">Destek Hizmeti</div>
          </div>
        </div>
      </div>

      <div class="features-home">
        <div class="section-header">
          <h2 class="section-title">Neden Pikaresk?</h2>
          <p class="section-subtitle">En iyi dijital alışveriş deneyimi için</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <span class="feature-icon">⚡</span>
            <h3 class="feature-title">Anında Teslimat</h3>
            <p class="feature-description">
              Ödeme yaptıktan sonra kodlarınız saniyeler içinde hesabınıza tanımlanır.
              Hemen kullanmaya başlayın!
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🛡️</span>
            <h3 class="feature-title">%100 Güvenli</h3>
            <p class="feature-description">
              SSL sertifikalı altyapımız ve güvenli ödeme sistemimizle verileriniz her
              zaman korunur.
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">💎</span>
            <h3 class="feature-title">En İyi Fiyatlar</h3>
            <p class="feature-description">
              Piyasanın en uygun fiyatları ve özel kampanyalarla tasarruf edin. Her
              zaman kazançlı çıkın!
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🎁</span>
            <h3 class="feature-title">Bonus Sistemler</h3>
            <p class="feature-description">
              Her alışverişinizde puan kazanın, özel indirimler ve kampanyalardan
              yararlanın.
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">💬</span>
            <h3 class="feature-title">7/24 Destek</h3>
            <p class="feature-description">
              Uzman destek ekibimiz her zaman yanınızda. Sorularınız için hemen bize
              ulaşın!
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🌟</span>
            <h3 class="feature-title">Geniş Ürün Yelpazesi</h3>
            <p class="feature-description">
              Oyun kodlarından streaming aboneliklerine, yazılımlardan mobil içeriklere
              binlerce ürün!
            </p>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <div class="cta-content">
          <h2 class="cta-title">Hemen Alışverişe Başla!</h2>
          <p class="cta-description">
            İlk siparişinde %10 indirim fırsatını kaçırma. Hemen üye ol ve özel
            tekliflerden yararlan!
          </p>
          <div class="hero-actions">
            <button class="hero-btn hero-btn-primary" type="button">
              <span>🚀</span>
              <span>Hemen Başla</span>
            </button>
            <button class="hero-btn hero-btn-secondary" type="button">
              <span>📱</span>
              <span>Uygulamayı İndir</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  const marketBtn = root.querySelector('[data-action="go-market"]');
  marketBtn?.addEventListener("click", () => {
    window.PIKARESK?.go?.("market");
  });

  const countEl = root.querySelector('[data-stat="user-count"]');
  if (countEl) {
    fetchUserCount()
      .then((count) => {
        countEl.textContent = formatNumber(count);
        localStorage.setItem("pikaresk_user_count", String(count));
      })
      .catch(() => {
        countEl.textContent = formattedUserCount;
      });
  }
}

function getUserCount() {
  const raw = localStorage.getItem("pikaresk_user_count");
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
}

function formatNumber(value) {
  try {
    return new Intl.NumberFormat("tr-TR").format(value);
  } catch {
    return String(value);
  }
}

