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
      { key: "dm", label: "DM" }
    ]
  },
  {
    title: "PLATFORM",
    items: [
      { key: "servers", label: "Sunucular" },
      { key: "games", label: "Oyunlar" },
      { key: "market", label: "E-Pin Market" }
    ]
  },
  {
    title: "SİSTEM",
    items: [
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
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.9));
  color: #e5e7eb;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(0, 255, 255, 0.12);
  box-shadow: 4px 0 24px rgba(0, 255, 255, 0.08);
}

.sidebar-header {
  padding: 18px 20px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 255, 255, 0.08);
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
  padding: 10px 14px 10px 18px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid transparent;
  color: #cbd5f5;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.sidebar-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #ff00e6, #00ffff);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.sidebar-item:hover {
  border-color: rgba(0, 255, 255, 0.3);
  background: rgba(15, 23, 42, 0.8);
  color: #fff;
  transform: translateX(2px);
}

.sidebar-item:hover::before {
  opacity: 1;
}

.sidebar-item.active {
  background: linear-gradient(135deg, rgba(255, 0, 230, 0.2), rgba(0, 255, 255, 0.2));
  border-color: rgba(0, 255, 255, 0.5);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.sidebar-item.active::before {
  opacity: 1;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.7);
}
`;
document.head.appendChild(style);

