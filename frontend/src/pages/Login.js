import "./Auth.css";
import { login } from "../services/authService.js";
import { ensureUserProfile } from "../services/userService.js";

export function Login(root) {
  const AUTH_KEY = "pikaresk_auth";
  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-left">
        <div class="auth-decor">
          <div class="decor-circle one"></div>
          <div class="decor-circle two"></div>
          <div class="decor-circle three"></div>
        </div>
        <div class="auth-left-content">
          <div class="auth-left-icon" aria-hidden="true">🎮</div>
          <h2 class="auth-left-title">Hoş Geldin!</h2>
          <p class="auth-left-text">
            Binlerce dijital ürüne anında erişim için giriş yap.
          </p>
          <div class="auth-left-list">
            <span><span class="auth-left-check">✓</span> Anında teslimat</span>
            <span><span class="auth-left-check">✓</span> Güvenli alışveriş</span>
            <span><span class="auth-left-check">✓</span> 7/24 destek</span>
          </div>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-brand" aria-hidden="true">
              <span class="auth-brand-icon">P</span>
              <span class="auth-brand-text">PIKARESK</span>
            </div>
            <h1 class="auth-title">Giris Yap</h1>
            <p class="auth-subtitle">Hesabina giris yaparak devam et.</p>
          </div>
          <form class="auth-form" id="loginForm">
            <div class="auth-group">
              <label class="auth-label" for="login-email">E-posta Adresi</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">@</span>
                <input class="auth-input" id="login-email" type="email" placeholder="ornek@email.com" required>
              </div>
            </div>
            <div class="auth-group">
              <label class="auth-label" for="login-password">Sifre</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">#</span>
                <input class="auth-input" id="login-password" type="password" placeholder="********" required>
                <button class="auth-toggle" type="button" data-toggle="password">Goster</button>
              </div>
            </div>
            <div class="auth-options">
              <label class="auth-checkbox">
                <input type="checkbox" id="remember-me">
                Beni hatirla
              </label>
              <a class="auth-link" href="#">Sifremi unuttum?</a>
            </div>
            <button class="auth-submit" type="submit">Giris Yap</button>
            <div class="auth-divider"><span>veya</span></div>
            <div class="auth-social">
              <button class="auth-social-btn" type="button">Google ile Giris</button>
            </div>
            <div class="auth-footer">
              Hesabin yok mu? <a class="auth-link" href="#" id="goRegister">Kayit ol</a>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;

  const toggleBtn = root.querySelector('[data-toggle="password"]');
  const passwordInput = root.querySelector("#login-password");
  toggleBtn?.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.textContent = isHidden ? "Gizle" : "Goster";
  });

  const consoleIcon = root.querySelector(".auth-left-icon");
  consoleIcon?.addEventListener("click", () => {
    consoleIcon.classList.add("is-pressed");
    setTimeout(() => consoleIcon.classList.remove("is-pressed"), 140);
  });

  const goRegister = root.querySelector("#goRegister");
  goRegister?.addEventListener("click", (event) => {
    event.preventDefault();
    window.PIKARESK?.go?.("register");
  });

  const loginForm = root.querySelector("#loginForm");
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = root.querySelector("#login-email")?.value?.trim() || "";
    const password = root.querySelector("#login-password")?.value || "";
    const submitBtn = loginForm.querySelector(".auth-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Giris yapiliyor...";
    try {
      const user = await login(email, password);
      await ensureUserProfile(user);
      localStorage.setItem(AUTH_KEY, "1");
      window.PIKARESK?.go?.("home");
    } catch (error) {
      showToast(error?.message || "Giris basarisiz.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Giris Yap";
    }
  });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "auth-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}
