import "./Auth.css";
import { register } from "../services/authService.js";
import { ensureUserProfile } from "../services/userService.js";

export function Register(root) {
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
          <h2 class="auth-left-title">Aramıza Katıl!</h2>
          <p class="auth-left-text">
            Hemen üye ol, özel fırsatlardan ve kampanyalardan yararlan.
          </p>
          <div class="auth-left-list">
            <span><span class="auth-left-check">✓</span> İlk siparişte indirim</span>
            <span><span class="auth-left-check">✓</span> Bonus puan sistemi</span>
            <span><span class="auth-left-check">✓</span> Özel kampanyalar</span>
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
            <h1 class="auth-title">Kayit Ol</h1>
            <p class="auth-subtitle">Hemen hesap olustur ve alisverise basla.</p>
          </div>
          <form class="auth-form" id="registerForm">
            <div class="auth-group">
              <label class="auth-label" for="register-name">Ad Soyad</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">A</span>
                <input class="auth-input" id="register-name" type="text" placeholder="Adiniz Soyadiniz" required>
              </div>
            </div>
            <div class="auth-group">
              <label class="auth-label" for="register-email">E-posta Adresi</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">@</span>
                <input class="auth-input" id="register-email" type="email" placeholder="ornek@email.com" required>
              </div>
            </div>
            <div class="auth-group">
              <label class="auth-label" for="register-password">Sifre</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">#</span>
                <input class="auth-input" id="register-password" type="password" placeholder="********" required>
                <button class="auth-toggle" type="button" data-toggle="password">Goster</button>
              </div>
            </div>
            <div class="auth-group">
              <label class="auth-label" for="register-confirm">Sifre Tekrar</label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">#</span>
                <input class="auth-input" id="register-confirm" type="password" placeholder="********" required>
                <button class="auth-toggle" type="button" data-toggle="confirm">Goster</button>
              </div>
            </div>
            <div class="auth-options">
              <label class="auth-checkbox">
                <input type="checkbox" id="terms-check" required>
                Kullanim sartlarini kabul ediyorum
              </label>
            </div>
            <button class="auth-submit" type="submit">Hesap Olustur</button>
            <div class="auth-divider"><span>veya</span></div>
            <div class="auth-social">
              <button class="auth-social-btn" type="button">Google ile Kayit Ol</button>
            </div>
            <div class="auth-footer">
              Zaten hesabin var mi? <a class="auth-link" href="#" id="goLogin">Giris Yap</a>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;

  const passwordInput = root.querySelector("#register-password");
  const confirmInput = root.querySelector("#register-confirm");
  const togglePassword = root.querySelector('[data-toggle="password"]');
  const toggleConfirm = root.querySelector('[data-toggle="confirm"]');

  togglePassword?.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePassword.textContent = isHidden ? "Gizle" : "Goster";
  });

  toggleConfirm?.addEventListener("click", () => {
    const isHidden = confirmInput.type === "password";
    confirmInput.type = isHidden ? "text" : "password";
    toggleConfirm.textContent = isHidden ? "Gizle" : "Goster";
  });

  const consoleIcon = root.querySelector(".auth-left-icon");
  consoleIcon?.addEventListener("click", () => {
    consoleIcon.classList.add("is-pressed");
    setTimeout(() => consoleIcon.classList.remove("is-pressed"), 140);
  });

  const goLogin = root.querySelector("#goLogin");
  goLogin?.addEventListener("click", (event) => {
    event.preventDefault();
    window.PIKARESK?.go?.("login");
  });

  const registerForm = root.querySelector("#registerForm");
  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (passwordInput.value !== confirmInput.value) {
      showToast("Sifreler eslesmiyor.");
      return;
    }
    const name = root.querySelector("#register-name")?.value?.trim() || "";
    const email = root.querySelector("#register-email")?.value?.trim() || "";
    const password = passwordInput.value || "";
    const submitBtn = registerForm.querySelector(".auth-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Kayit yapiliyor...";
    try {
      const user = await register(email, password, name);
      await ensureUserProfile(user);
      localStorage.setItem(AUTH_KEY, "1");
      window.PIKARESK?.go?.("home");
    } catch (error) {
      showToast(error?.message || "Kayit basarisiz.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Hesap Olustur";
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
