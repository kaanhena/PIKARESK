// src/components/Sidebar.js

const sections = [
  {
    title: "GENEL",
    items: [
      { key: "home", label: "Ana Sayfa" },
      { key: "profile", label: "Profil" }
    ]
  },
  {
    title: "SOSYAL",
    items: [
      { key: "friends", label: "Arkadaşlar" },
      { key: "chat", label: "Chat" }
    ]
  },
  {
    title: "PLATFORM",
    items: [
      { key: "servers", label: "Sunucular" },
      { key: "games", label: "Oyunlar" },
      { key: "market", label: "Market" }
    ]
  },
  {
    title: "SİSTEM",
    items: [
      { key: "admin", label: "Admin" },
      { key: "settings", label: "Ayarlar" }
    ]
  }
];

let activeKey = "home";

export function Sidebar(root, { active = "home", onNavigate } = {}) {
  activeKey = active;

  root.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="logo">PIKARESK</span>
      </div>

      <nav class="sidebar-nav">
        ${sections
          .map(
            (section) => `
          <div class="sidebar-section">
            <div class="sidebar-section-title">${section.title}</div>
            ${section.items
              .map(
                (item) => `
              <button
                class="sidebar-item ${item.key === activeKey ? "active" : ""}"
                data-nav="${item.key}"
              >
                ${item.label}
              </button>
            `
              )
              .join("")}
          </div>
        `
          )
          .join("")}
      </nav>
    </aside>
  `;

  root.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.nav;
      activeKey = key;
      Sidebar(root, { active: key, onNavigate });
      onNavigate?.(key);
    });
  });
}

/* INLINE CSS (şimdilik burada, sonra ayrı dosyaya taşırız) */
const style = document.createElement("style");
style.textContent = `
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: linear-gradient(180deg, #0b1220, #0f172a);
  color: #e5e7eb;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.06);
}

.sidebar-header {
  padding: 20px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1px;
}

.sidebar-nav {
  padding: 0 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 6px;
}

.sidebar-item {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: #cbd5f5;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sidebar-item:hover {
  background: rgba(99,102,241,0.15);
  color: #fff;
}

.sidebar-item.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
}
`;
document.head.appendChild(style);
