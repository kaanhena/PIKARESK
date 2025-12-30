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
            <span>Premium Dijital Urunler</span>
          </div>
          <h1 class="hero-title">Oyun Dunyasina Hos Geldin!</h1>
          <p class="hero-description">
            En populer oyunlar, streaming platformlari ve dijital urunler icin guvenli ve
            hizli alisveris deneyimi. Binlerce urunden hemen sec, aninda teslim al!
          </p>
          <div class="hero-actions">
            <button class="hero-btn hero-btn-primary" type="button" data-action="go-market">
              <span>🛍️</span>
              <span>Market'i Kesfet</span>
            </button>
            <button class="hero-btn hero-btn-secondary" type="button">
              <span>🎮</span>
              <span>Populer Oyunlar</span>
            </button>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value" data-stat="user-count">${formattedUserCount}</div>
            <div class="stat-label">Mutlu Kullanici</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-value">150K+</div>
            <div class="stat-label">Tamamlanan Siparis</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-value">%99.8</div>
            <div class="stat-label">Basari Orani</div>
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
          <p class="section-subtitle">En iyi dijital alisveris deneyimi icin</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <span class="feature-icon">⚡</span>
            <h3 class="feature-title">Aninda Teslimat</h3>
            <p class="feature-description">
              Odeme yaptiktan sonra kodlariniz saniyeler icinde hesabiniza tanimlanir.
              Hemen kullanmaya baslayin!
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🛡️</span>
            <h3 class="feature-title">%100 Guvenli</h3>
            <p class="feature-description">
              SSL sertifikali altyapimiz ve guvenli odeme sistemimizle verileriniz her
              zaman korunur.
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">💎</span>
            <h3 class="feature-title">En Iyi Fiyatlar</h3>
            <p class="feature-description">
              Piyasanin en uygun fiyatlari ve ozel kampanyalarla tasarruf edin. Her
              zaman kazancili cikin!
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🎁</span>
            <h3 class="feature-title">Bonus Sistemler</h3>
            <p class="feature-description">
              Her alisverisinizde puan kazanin, ozel indirimler ve kampanyalardan
              yararlanin.
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">💬</span>
            <h3 class="feature-title">7/24 Destek</h3>
            <p class="feature-description">
              Uzman destek ekibimiz her zaman yaninizda. Sorulariniz icin hemen bize
              ulasin!
            </p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🌟</span>
            <h3 class="feature-title">Genis Urun Yelpazesi</h3>
            <p class="feature-description">
              Oyun kodlarindan streaming aboneliklerine, yazilimlardan mobil iceriklere
              binlerce urun!
            </p>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <div class="cta-content">
          <h2 class="cta-title">Hemen Alisverise Basla!</h2>
          <p class="cta-description">
            Ilk siparisinde %10 indirim firsatini kacirma. Hemen uye ol ve ozel
            tekliflerden yararlan!
          </p>
          <div class="hero-actions">
            <button class="hero-btn hero-btn-primary" type="button">
              <span>🚀</span>
              <span>Hemen Basla</span>
            </button>
            <button class="hero-btn hero-btn-secondary" type="button">
              <span>📱</span>
              <span>Uygulamayi Indir</span>
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

