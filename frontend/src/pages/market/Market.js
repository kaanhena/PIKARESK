// src/pages/market/Market.js
import "./Market.css";

const CART_KEY = "pikaresk_cart_items";
const CART_COUNT_KEY = "pikaresk_cart_count";

const featuredProducts = [
  {
    name: "Steam Wallet Code",
    description: "Steam cüzdanına bakiye yükle, binlerce oyuna erişim",
    price: 50,
    emoji: "🎮",
    badge: "Popüler",
  },
  {
    name: "Riot Points",
    description: "League of Legends, Valorant için RP",
    price: 100,
    emoji: "⚔️",
    badge: "Yeni",
  },
  {
    name: "Netflix Premium",
    description: "1 aylık Netflix Premium hesap",
    price: 149,
    emoji: "🎬",
  },
  {
    name: "Spotify Premium",
    description: "3 aylık Spotify Premium üyelik",
    price: 89,
    emoji: "🎵",
    badge: "İndirim",
  },
  {
    name: "PUBG Mobile UC",
    description: "600 UC + 60 Bonus UC",
    price: 75,
    emoji: "🔫",
  },
  {
    name: "PlayStation Plus",
    description: "12 aylık PS Plus üyelik",
    price: 399,
    emoji: "🎮",
  },
  {
    name: "Discord Nitro",
    description: "1 aylık Discord Nitro üyelik",
    price: 44,
    emoji: "💬",
    badge: "Popüler",
  },
  {
    name: "YouTube Premium",
    description: "Reklamsız YouTube deneyimi",
    price: 29,
    emoji: "📹",
  },
];

const gamingSections = [
  {
    title: "PC Oyunları",
    icon: "🎮",
    products: [
      {
        name: "Steam Wallet 50 TL",
        description: "Steam cüzdanına bakiye",
        price: 50,
        emoji: "🎮",
      },
      {
        name: "Riot Points 1380 RP",
        description: "LoL & Valorant için",
        price: 100,
        emoji: "⚔️",
      },
      {
        name: "Blizzard Balance",
        description: "WoW, Overwatch, Diablo",
        price: 150,
        emoji: "🎯",
      },
    ],
  },
  {
    title: "Mobil Oyunlar",
    icon: "📱",
    products: [
      {
        name: "PUBG Mobile 600 UC",
        description: "+60 Bonus UC",
        price: 75,
        emoji: "🔫",
      },
      {
        name: "Mobile Legends Diamonds",
        description: "500 Elmas",
        price: 80,
        emoji: "💎",
      },
      {
        name: "Free Fire Diamonds",
        description: "530 Elmas",
        price: 65,
        emoji: "⚡",
      },
    ],
  },
];

const streamingProducts = [
  {
    name: "Netflix Premium 1 Ay",
    description: "Ultra HD izleme, 4 cihaz",
    price: 149,
    emoji: "🎬",
  },
  {
    name: "Spotify Premium 3 Ay",
    description: "Reklamsız müzik",
    price: 89,
    emoji: "🎵",
  },
  {
    name: "YouTube Premium",
    description: "Reklamsız + YouTube Music",
    price: 29,
    emoji: "📹",
  },
  {
    name: "Disney+ Premium",
    description: "1 aylık üyelik",
    price: 99,
    emoji: "📺",
  },
];

const softwareProducts = [
  {
    name: "Microsoft Office 365",
    description: "1 yıllık lisans",
    price: 399,
    emoji: "💻",
  },
  {
    name: "Nord VPN Premium",
    description: "1 yıllık abonelik",
    price: 199,
    emoji: "🛡️",
  },
  {
    name: "Kaspersky Total Security",
    description: "1 cihaz, 1 yıl",
    price: 149,
    emoji: "🔒",
  },
  {
    name: "Adobe Creative Cloud",
    description: "Tüm uygulamalar, 1 ay",
    price: 299,
    emoji: "🎨",
  },
];

const mobileProducts = [
  {
    name: "App Store & iTunes 50 TL",
    description: "Türkiye bölgesi",
    price: 50,
    emoji: "🍎",
  },
  {
    name: "Google Play 100 TL",
    description: "Türkiye bölgesi",
    price: 100,
    emoji: "🤖",
  },
];

const walletTransactions = [
  {
    id: "İşlem #2847",
    status: "Tamamlandı",
    statusClass: "completed",
    product: "💰 Bakiye Yükleme",
    price: "+₺500.00",
  },
  {
    id: "İşlem #2846",
    status: "Tamamlandı",
    statusClass: "completed",
    product: "Steam Wallet Code satın alma",
    price: "-₺50.00",
  },
];

const orders = [
  {
    id: "Sipariş #12847",
    status: "Teslim Edildi",
    statusClass: "completed",
    product: "Steam Wallet Code - 50 TL",
    code: "🔑 XXXX-YYYY-ZZZZ-AAAA",
    price: "₺50.00",
  },
  {
    id: "Sipariş #12846",
    status: "Teslim Edildi",
    statusClass: "completed",
    product: "Riot Points - 1380 RP",
    code: "🔑 1234-5678-9ABC-DEFG",
    price: "₺100.00",
  },
  {
    id: "Sipariş #12845",
    status: "İşleniyor",
    statusClass: "pending",
    product: "Discord Nitro - 1 Ay",
    code: "⏳ Kod hazırlanıyor...",
    price: "₺44.00",
  },
  {
    id: "Sipariş #12844",
    status: "Teslim Edildi",
    statusClass: "completed",
    product: "Netflix Premium - 1 Ay",
    code: "🔑 netflix@example.com / Pass123",
    price: "₺149.00",
  },
];

function renderProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-image">
        ${product.emoji}
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description}</div>
        <div class="product-footer">
          <div>
            <span class="product-price-label">Fiyat</span>
            <div class="product-price">₺${product.price}</div>
          </div>
          <button class="product-buy-btn">Satın Al</button>
        </div>
      </div>
    </div>
  `;
}

function renderProductGrid(products) {
  return `<div class="market-grid">${products.map(renderProductCard).join("")}</div>`;
}

function renderCategorySection(section) {
  return `
    <div class="category-section">
      <div class="category-title">
        <span class="category-icon">${section.icon}</span>${section.title}
      </div>
      ${renderProductGrid(section.products)}
    </div>
  `;
}

function loadCartItems() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  localStorage.setItem(CART_COUNT_KEY, String(getCartCount(items)));
}

function getCartCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function parsePrice(value) {
  const numeric = value.replace(/[^0-9.,]/g, "").replace(",", ".");
  return Number(numeric) || 0;
}

function formatPrice(amount) {
  return `₺${amount.toFixed(2)}`;
}

function buildProductFromCard(card) {
  const name = card.querySelector(".product-name")?.textContent?.trim() ?? "Ürün";
  const description =
    card.querySelector(".product-description")?.textContent?.trim() ?? "";
  const priceText = card.querySelector(".product-price")?.textContent ?? "₺0";
  const price = parsePrice(priceText);
  const emoji = card.querySelector(".product-image")?.childNodes[0]?.textContent?.trim() ?? "🛒";
  return { name, description, price, emoji };
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "market-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

export function Market(root) {
  root.innerHTML = `
    <main class="market-container">
      <header class="market-header">
        <nav class="market-nav">
          <div class="market-menu-item active" data-section="featured">
            <span class="market-menu-item-icon">⭐</span>
            <span class="market-menu-item-text">Öne Çıkanlar</span>
          </div>
          <div class="market-menu-item" data-section="gaming">
            <span class="market-menu-item-icon">🎮</span>
            <span class="market-menu-item-text">Oyun</span>
          </div>
          <div class="market-menu-item" data-section="streaming">
            <span class="market-menu-item-icon">📺</span>
            <span class="market-menu-item-text">Streaming</span>
          </div>
          <div class="market-menu-item" data-section="software">
            <span class="market-menu-item-icon">💻</span>
            <span class="market-menu-item-text">Yazılım</span>
          </div>
          <div class="market-menu-item" data-section="mobile">
            <span class="market-menu-item-icon">📱</span>
            <span class="market-menu-item-text">Mobil</span>
          </div>
          <div class="market-menu-item" data-section="wallet">
            <span class="market-menu-item-icon">💳</span>
            <span class="market-menu-item-text">Cüzdanım</span>
          </div>
          <div class="market-menu-item" data-section="orders">
            <span class="market-menu-item-icon">📦</span>
            <span class="market-menu-item-text">Siparişlerim</span>
          </div>
        </nav>
        <div class="market-actions">
          <div class="market-balance">
            <span class="market-balance-icon">💰</span>
            <span>₺458.50</span>
          </div>
          <div class="market-cart" id="marketCart">
            🛒 Sepet <span class="market-cart-badge" id="cartBadge">0</span>
          </div>
        </div>
      </header>
      <section class="market-content" id="marketContent">
        <div class="market-content-section" id="featured">
          <header class="market-content-header">
            <h1>⭐ E-Pin Market</h1>
            <p>En popüler e-pin ve dijital ürünler</p>
          </header>
          <div class="market-search">
            <input type="text" class="market-search-input" placeholder="🔍 Ürün ara... (Steam, Riot, Netflix, Spotify)">
          </div>
          ${renderProductGrid(featuredProducts)}
        </div>
        <div class="market-content-section" id="gaming" style="display: none;">
          <header class="market-content-header">
            <h1>🎮 Oyun E-Pin'leri</h1>
            <p>Tüm popüler oyunlar için bakiye ve içerik</p>
          </header>
          <div class="market-search">
            <input type="text" class="market-search-input" placeholder="🔍 Oyun ara...">
          </div>
          ${gamingSections.map(renderCategorySection).join("")}
        </div>
        <div class="market-content-section" id="streaming" style="display: none;">
          <header class="market-content-header">
            <h1>📺 Streaming Platformları</h1>
            <p>Film, dizi ve müzik platformlarına erişim</p>
          </header>
          ${renderProductGrid(streamingProducts)}
        </div>
        <div class="market-content-section" id="software" style="display: none;">
          <header class="market-content-header">
            <h1>💻 Yazılım & Araçlar</h1>
            <p>Üretkenlik ve güvenlik araçları</p>
          </header>
          ${renderProductGrid(softwareProducts)}
        </div>
        <div class="market-content-section" id="mobile" style="display: none;">
          <header class="market-content-header">
            <h1>📱 Mobil İçerikler</h1>
            <p>Uygulama mağazası bakiyeleri</p>
          </header>
          ${renderProductGrid(mobileProducts)}
        </div>
        <div class="market-content-section" id="wallet" style="display: none;">
          <header class="market-content-header">
            <h1>💳 Cüzdanım</h1>
            <p>Bakiyenizi yönetin ve geçmiş işlemlerinizi görün</p>
          </header>
          <div class="wallet-card">
            <div class="wallet-balance">
              <div class="wallet-balance-label">Mevcut Bakiye</div>
              <div class="wallet-balance-amount">₺458.50</div>
              <div class="wallet-actions">
                <button class="wallet-btn">💰 Bakiye Yükle</button>
                <button class="wallet-btn wallet-btn-secondary">📊 İşlem Geçmişi</button>
              </div>
            </div>
          </div>
          <div class="category-section">
            <div class="category-title">
              <span class="category-icon">📈</span>Son İşlemler
            </div>
            ${walletTransactions
              .map(
                (transaction) => `
                <div class="order-card">
                  <div class="order-header">
                    <div class="order-id">${transaction.id}</div>
                    <div class="order-status ${transaction.statusClass}">
                      ${transaction.status}
                    </div>
                  </div>
                  <div class="order-details">
                    <div class="order-product">
                      <div class="order-product-name">${transaction.product}</div>
                    </div>
                    <div class="order-price">${transaction.price}</div>
                  </div>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
        <div class="market-content-section" id="orders" style="display: none;">
          <header class="market-content-header">
            <h1>📦 Siparişlerim</h1>
            <p>Tüm e-pin siparişleriniz ve kodlarınız</p>
          </header>
          ${orders
            .map(
              (order) => `
              <div class="order-card">
                <div class="order-header">
                  <div class="order-id">${order.id}</div>
                  <div class="order-status ${order.statusClass}">${order.status}</div>
                </div>
                <div class="order-details">
                  <div class="order-product">
                    <div class="order-product-name">${order.product}</div>
                    <div class="order-product-code">${order.code}</div>
                  </div>
                  <div class="order-price">${order.price}</div>
                </div>
              </div>
            `
            )
            .join("")}
        </div>
      </section>
    </main>
    <div class="market-overlay" id="marketOverlay"></div>
    <aside class="market-cart-drawer" id="cartDrawer">
      <div class="market-cart-header">
        <h3>Sepet</h3>
        <button class="market-close-btn" id="closeCart">✕</button>
      </div>
      <div class="market-cart-items" id="cartItems"></div>
      <div class="market-cart-footer">
        <div class="market-cart-total">
          <span>Toplam</span>
          <strong id="cartTotal">₺0.00</strong>
        </div>
        <button class="market-cart-checkout" id="checkoutBtn">Ödemeye Geç</button>
      </div>
    </aside>
    <div class="market-modal" id="productModal">
      <div class="market-modal-content">
        <button class="market-close-btn" id="closeProduct">✕</button>
        <div class="market-modal-hero" id="modalHero">🎁</div>
        <h2 class="market-modal-title" id="modalName">Ürün</h2>
        <p class="market-modal-desc" id="modalDesc"></p>
        <div class="market-modal-price" id="modalPrice">₺0.00</div>
        <div class="market-modal-actions">
          <button class="market-btn-secondary" id="modalAdd">Sepete Ekle</button>
          <button class="market-btn-primary" id="modalBuy">Hemen Satın Al</button>
        </div>
      </div>
    </div>
    <div class="market-modal" id="checkoutModal">
      <div class="market-modal-content">
        <button class="market-close-btn" id="closeCheckout">✕</button>
        <h2 class="market-modal-title">Ödeme</h2>
        <p class="market-modal-desc">
          Bu ekran demo amaçlıdır. Ödeme onayı sonrası siparişler listenize eklenir.
        </p>
        <div class="market-checkout-summary">
          <span>Toplam</span>
          <strong id="checkoutTotal">₺0.00</strong>
        </div>
        <div class="market-modal-actions">
          <button class="market-btn-secondary" id="checkoutCancel">Vazgeç</button>
          <button class="market-btn-primary" id="confirmCheckout">Ödemeyi Tamamla</button>
        </div>
      </div>
    </div>
  `;

  const menuItems = root.querySelectorAll(".market-menu-item");
  const contentSections = root.querySelectorAll(".market-content-section");
  const cartBadge = root.querySelector("#cartBadge");
  const cartDrawer = root.querySelector("#cartDrawer");
  const cartItemsEl = root.querySelector("#cartItems");
  const cartTotalEl = root.querySelector("#cartTotal");
  const checkoutTotalEl = root.querySelector("#checkoutTotal");
  const cartButton = root.querySelector("#marketCart");
  const overlay = root.querySelector("#marketOverlay");
  const checkoutBtn = root.querySelector("#checkoutBtn");
  const closeCart = root.querySelector("#closeCart");
  const productModal = root.querySelector("#productModal");
  const checkoutModal = root.querySelector("#checkoutModal");
  const modalHero = root.querySelector("#modalHero");
  const modalName = root.querySelector("#modalName");
  const modalDesc = root.querySelector("#modalDesc");
  const modalPrice = root.querySelector("#modalPrice");
  const modalAdd = root.querySelector("#modalAdd");
  const modalBuy = root.querySelector("#modalBuy");
  const closeProduct = root.querySelector("#closeProduct");
  const closeCheckout = root.querySelector("#closeCheckout");
  const checkoutCancel = root.querySelector("#checkoutCancel");
  const confirmCheckout = root.querySelector("#confirmCheckout");

  let cartItems = loadCartItems();
  let activeProduct = null;

  function activateSection(sectionId) {
    menuItems.forEach((item) => {
      item.classList.toggle("active", item.getAttribute("data-section") === sectionId);
    });
    contentSections.forEach((section) => {
      section.style.display = section.id === sectionId ? "block" : "none";
    });
  }

  function updateCartUI() {
    cartBadge.textContent = String(getCartCount(cartItems));
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalEl.textContent = formatPrice(total);
    checkoutTotalEl.textContent = formatPrice(total);

    if (cartItems.length === 0) {
      cartItemsEl.innerHTML = `<div class="market-cart-empty">Sepetiniz boş.</div>`;
      return;
    }

    cartItemsEl.innerHTML = cartItems
      .map(
        (item) => `
        <div class="market-cart-item" data-name="${item.name}">
          <div class="market-cart-item-info">
            <div class="market-cart-item-name">${item.emoji} ${item.name}</div>
            <div class="market-cart-item-meta">${formatPrice(item.price)} x ${item.quantity}</div>
          </div>
          <div class="market-cart-item-actions">
            <button data-action="decrease">-</button>
            <button data-action="increase">+</button>
            <button data-action="remove">✕</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  function openCart() {
    cartDrawer.classList.add("active");
    overlay.classList.add("active");
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove("active");
    overlay.classList.remove("active");
  }

  function openProductModal(product) {
    activeProduct = product;
    modalHero.textContent = product.emoji;
    modalName.textContent = product.name;
    modalDesc.textContent = product.description;
    modalPrice.textContent = formatPrice(product.price);
    productModal.classList.add("active");
  }

  function closeProductModal() {
    productModal.classList.remove("active");
  }

  function openCheckout() {
    checkoutModal.classList.add("active");
  }

  function closeCheckoutModal() {
    checkoutModal.classList.remove("active");
  }

  function addToCart(product) {
    const existing = cartItems.find((item) => item.name === product.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.push({ ...product, quantity: 1 });
    }
    saveCartItems(cartItems);
    updateCartUI();
  }

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.getAttribute("data-section");
      activateSection(section);
    });
  });

  root.querySelectorAll(".product-buy-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const card = button.closest(".product-card");
      const product = buildProductFromCard(card);
      addToCart(product);
      showToast(`${product.name} sepete eklendi.`);
      button.textContent = "✓ Eklendi";
      button.style.background = "rgba(34, 197, 94, 0.8)";
      setTimeout(() => {
        button.textContent = "Satın Al";
        button.style.background = "";
      }, 1200);
    });
  });

  root.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      openProductModal(buildProductFromCard(card));
    });
  });

  root.querySelectorAll(".market-search-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const searchTerm = event.target.value.toLowerCase();
      const section = input.closest(".market-content-section");
      const products = section.querySelectorAll(".product-card");

      products.forEach((product) => {
        const name = product.querySelector(".product-name")?.textContent.toLowerCase() ?? "";
        const desc =
          product.querySelector(".product-description")?.textContent.toLowerCase() ?? "";
        const matches = name.includes(searchTerm) || desc.includes(searchTerm);
        product.style.display = matches ? "block" : "none";
      });
    });
  });

  cartButton.addEventListener("click", openCart);
  closeCart.addEventListener("click", closeCartDrawer);
  overlay.addEventListener("click", closeCartDrawer);

  cartItemsEl.addEventListener("click", (event) => {
    const action = event.target.getAttribute("data-action");
    if (!action) {
      return;
    }

    const itemEl = event.target.closest(".market-cart-item");
    const name = itemEl?.getAttribute("data-name");
    const item = cartItems.find((entry) => entry.name === name);
    if (!item) {
      return;
    }

    if (action === "increase") {
      item.quantity += 1;
    }

    if (action === "decrease") {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cartItems = cartItems.filter((entry) => entry.name !== name);
      }
    }

    if (action === "remove") {
      cartItems = cartItems.filter((entry) => entry.name !== name);
    }

    saveCartItems(cartItems);
    updateCartUI();
  });

  modalAdd.addEventListener("click", () => {
    if (!activeProduct) {
      return;
    }
    addToCart(activeProduct);
    showToast(`${activeProduct.name} sepete eklendi.`);
    closeProductModal();
  });

  modalBuy.addEventListener("click", () => {
    if (!activeProduct) {
      return;
    }
    addToCart(activeProduct);
    closeProductModal();
    openCart();
    openCheckout();
  });

  closeProduct.addEventListener("click", closeProductModal);
  productModal.addEventListener("click", (event) => {
    if (event.target === productModal) {
      closeProductModal();
    }
  });

  checkoutBtn.addEventListener("click", () => {
    if (cartItems.length === 0) {
      showToast("Sepetiniz boş.");
      return;
    }
    openCheckout();
  });

  closeCheckout.addEventListener("click", closeCheckoutModal);
  checkoutCancel.addEventListener("click", closeCheckoutModal);
  checkoutModal.addEventListener("click", (event) => {
    if (event.target === checkoutModal) {
      closeCheckoutModal();
    }
  });

  confirmCheckout.addEventListener("click", () => {
    if (cartItems.length === 0) {
      showToast("Sepetiniz boş.");
      closeCheckoutModal();
      return;
    }
    cartItems = [];
    saveCartItems(cartItems);
    updateCartUI();
    closeCheckoutModal();
    closeCartDrawer();
    showToast("Ödeme tamamlandı. Siparişleriniz güncellendi.");
  });

  updateCartUI();

  const focusName = localStorage.getItem("pikaresk_market_focus");
  if (focusName) {
    localStorage.removeItem("pikaresk_market_focus");
    const cards = Array.from(root.querySelectorAll(".product-card"));
    const target = cards.find(
      (card) => card.querySelector(".product-name")?.textContent?.trim() === focusName
    );
    if (target) {
      const section = target.closest(".market-content-section");
      if (section) {
        activateSection(section.id);
      }
      target.classList.add("is-highlighted");
      openProductModal(buildProductFromCard(target));
      setTimeout(() => target.classList.remove("is-highlighted"), 2000);
    }
  }
}
