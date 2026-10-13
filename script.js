// ========================================
// byBFÉ — WEBSITE + Google Sheets Backend
// ========================================

// >>> GANTI URL INI setelah deploy Apps Script Web App <<<
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID/exec";

// Nomor WhatsApp
const WA_NUMBER = "6282269190930";
const WA_TEMPLATE = "Halo kak aku mau pesan desain .... /.... pack ya;";

// State
let products = [];          // dari Google Sheet
let cart = [];              // [{id, name, price, qty}]
let appliedPromo = null;    // {code, discount_percent, ...}

// Format Rupiah
function formatRp(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

// ========================================
// SLIDER
// ========================================
const slides = document.querySelectorAll(".slide");
const track = document.getElementById("slides");
const dots = document.getElementById("dots");
let index = 0;
let auto;

slides.forEach((_, i) => {
  const button = document.createElement("button");
  button.setAttribute("aria-label", `Slide ${i + 1}`);
  button.onclick = () => goToSlide(i);
  dots.appendChild(button);
});

function goToSlide(i) {
  index = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${index * 100}%)`;
  [...dots.children].forEach((button, number) => {
    button.classList.toggle("active", number === index);
  });
  clearInterval(auto);
  auto = setInterval(() => goToSlide(index + 1), 5000);
}
goToSlide(0);

document.getElementById("prev").onclick = () => goToSlide(index - 1);
document.getElementById("next").onclick = () => goToSlide(index + 1);

// ========================================
// MENU MOBILE
// ========================================
const menuButton = document.getElementById("menu");
const navigation = document.getElementById("nav");

menuButton.onclick = () => navigation.classList.toggle("open");
document.querySelectorAll("#nav a").forEach(link => {
  link.onclick = () => navigation.classList.remove("open");
});

// ========================================
// SEARCH
// ========================================
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

document.getElementById("searchOpen").onclick = () => {
  searchPanel.classList.add("open");
  searchInput.focus();
};
document.getElementById("searchClose").onclick = () => {
  searchPanel.classList.remove("open");
};

searchInput.oninput = event => {
  const keyword = event.target.value.toLowerCase().trim();
  if (!keyword) {
    searchResults.innerHTML = "";
    return;
  }
  const found = products.filter(p =>
    p.name.toLowerCase().includes(keyword) ||
    (p.color && p.color.toLowerCase().includes(keyword)) ||
    (p.category && p.category.toLowerCase().includes(keyword))
  );
  if (found.length) {
    searchResults.innerHTML = found
      .map(p => `<a href="#collection" class="search-item" data-id="${p.id}">• ${p.name} — ${formatRp(p.price)}</a>`)
      .join("");
    searchResults.querySelectorAll(".search-item").forEach(el => {
      el.onclick = () => searchPanel.classList.remove("open");
    });
  } else {
    searchResults.innerHTML = "Produk tidak ditemukan.";
  }
};

// ========================================
// LANGUAGE ID / EN
// ========================================
const translations = {
  id: {
    hero: "Temukan outfit modern dengan siluet clean, warna berkarakter, dan detail yang membuat gaya kamu terasa personal.",
    shop: "Lihat Koleksi →",
    discover: "Kenal byBFÉ",
    collection: "Koleksi pilihan untuk gaya sehari-hari, acara spesial, dan momen ketika kamu ingin tampil lebih percaya diri.",
    promo: "Nikmati potongan 10% untuk pembelian pertama dengan kode BYBFE10.",
    about: "byBFÉ menghadirkan outfit dengan pendekatan modern, minimalis, dan mudah dipadukan. Kami percaya gaya terbaik adalah gaya yang terasa nyaman dan tetap menunjukkan karakter pemakainya."
  },
  en: {
    hero: "Discover modern outfits with clean silhouettes, distinctive colors, and details that make your style feel personal.",
    shop: "Shop Collection →",
    discover: "Meet byBFÉ",
    collection: "Curated pieces for everyday style, special occasions, and moments when you want to feel more confident.",
    promo: "Enjoy 10% off your first order with code BYBFE10.",
    about: "byBFÉ creates modern, minimal, and easy-to-style outfits. We believe great style should feel comfortable while still expressing the wearer's character."
  }
};

document.querySelectorAll(".lang").forEach(button => {
  button.onclick = () => {
    const language = button.dataset.lang;
    document.querySelectorAll(".lang").forEach(item => {
      item.classList.toggle("active", item === button);
    });
    document.querySelectorAll("#nav a").forEach(link => {
      link.textContent = link.dataset[language];
    });
    document.querySelector('[data-copy="hero"]').textContent = translations[language].hero;
    document.querySelector('[data-copy="shop"]').textContent = translations[language].shop;
    document.querySelector('[data-copy="discover"]').textContent = translations[language].discover;
    document.querySelector('[data-copy="collection"]').textContent = translations[language].collection;
    document.querySelector('[data-copy="promo"]').innerHTML =
      translations[language].promo.replace("BYBFE10", "<strong>BYBFE10</strong>");
    document.querySelector('[data-copy="about"]').textContent = translations[language].about;
    searchInput.placeholder = language === "id" ? "Cari outfit..." : "Search outfits...";
  };
});

// ========================================
// LOAD PRODUCTS FROM GOOGLE SHEETS
// ========================================
async function loadProducts() {
  const loading = document.getElementById("productsLoading");
  const grid = document.getElementById("productsGrid");

  // Fallback produk lokal kalau Apps Script belum di-set
  const fallback = [
    { id: "1", name: "Maroon Elara Set", price: 489000, category: "Set", color: "Maroon", tag: "BESTSELLER", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85", stock: 10 },
    { id: "2", name: "Navy Aira Dress", price: 429000, category: "Dress", color: "Navy", tag: "", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85", stock: 8 },
    { id: "3", name: "Ivory Noura Outer", price: 379000, category: "Outer", color: "Ivory", tag: "NEW", image: "https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=900&q=85", stock: 12 },
    { id: "4", name: "Mahogany Raya Set", price: 459000, category: "Set", color: "Mahogany", tag: "", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85", stock: 6 }
  ];

  try {
    if (APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
      products = fallback;
    } else {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=products`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.products) && data.products.length) {
        products = data.products;
      } else {
        products = fallback;
      }
    }
  } catch (err) {
    console.warn("Gagal load produk dari Sheets, pakai fallback:", err);
    products = fallback;
  }

  loading.style.display = "none";
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = products.map(p => {
    const outOfStock = p.stock <= 0;
    const tagHtml = p.tag ? `<span>${p.tag}</span>` : "";
    const btnText = outOfStock ? "Habis" : "+ Tambah ke keranjang";
    const btnDisabled = outOfStock ? "disabled" : "";
    return `
      <article class="product" data-id="${p.id}" data-name="${p.name}">
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          ${tagHtml}
          <button class="add" data-id="${p.id}" ${btnDisabled}>${btnText}</button>
        </div>
        <div class="product-info">
          <div>
            <h3>${p.name}</h3>
            <small>${p.color || ""} · ${p.category || ""}</small>
          </div>
          <b>${formatRp(p.price)}</b>
        </div>
      </article>
    `;
  }).join("");

  // Bind add-to-cart
  grid.querySelectorAll(".add:not([disabled])").forEach(btn => {
    btn.onclick = () => addToCart(btn.dataset.id);
  });
}

// ========================================
// CART
// ========================================
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock <= 0) return;

  const existing = cart.find(c => c.id === productId);
  if (existing) {
    if (existing.qty >= product.stock) {
      showToast("Stok tidak cukup");
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }
  renderCart();
  showToast(product.name + " ditambahkan ke keranjang");
}

function removeItem(index) {
  cart.splice(index, 1);
  if (cart.length === 0) appliedPromo = null;
  renderCart();
}
window.removeItem = removeItem;

function changeQty(index, delta) {
  const item = cart[index];
  if (!item) return;
  const product = products.find(p => p.id === item.id);
  const newQty = item.qty + delta;
  if (newQty < 1) {
    removeItem(index);
    return;
  }
  if (product && newQty > product.stock) {
    showToast("Stok tidak cukup");
    return;
  }
  item.qty = newQty;
  renderCart();
}
window.changeQty = changeQty;

function getSubtotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function getDiscount() {
  if (!appliedPromo) return 0;
  const sub = getSubtotal();
  if (appliedPromo.min_order && sub < appliedPromo.min_order) return 0;
  return Math.round(sub * (appliedPromo.discount_percent / 100));
}

function getTotal() {
  return Math.max(0, getSubtotal() - getDiscount());
}

function renderCart() {
  const cartCount = document.getElementById("cartCount");
  const totalEl = document.getElementById("total");
  const cartItems = document.getElementById("cartItems");
  const summary = document.getElementById("cartSummary");

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = itemCount;
  totalEl.textContent = itemCount;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Keranjang masih kosong.</p>";
    summary.style.display = "none";
    appliedPromo = null;
    document.getElementById("promoInput").value = "";
    return;
  }

  cartItems.innerHTML = cart.map((item, i) => `
    <div class="cart-row">
      <div class="cart-row-info">
        <span class="cart-name">${item.name}</span>
        <span class="cart-price">${formatRp(item.price)} × ${item.qty}</span>
      </div>
      <div class="cart-row-actions">
        <button onclick="changeQty(${i}, -1)" aria-label="Kurangi">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${i}, 1)" aria-label="Tambah">+</button>
        <button class="remove-btn" onclick="removeItem(${i})">Hapus</button>
      </div>
    </div>
  `).join("");

  // Summary
  summary.style.display = "block";
  document.getElementById("subtotalText").textContent = formatRp(getSubtotal());
  const disc = getDiscount();
  const discountRow = document.getElementById("discountRow");
  if (disc > 0) {
    discountRow.style.display = "flex";
    document.getElementById("discountText").textContent = "− " + formatRp(disc);
  } else {
    discountRow.style.display = "none";
  }
  document.getElementById("totalText").textContent = formatRp(getTotal());
}

// Promo apply
document.getElementById("promoApply").onclick = async () => {
  const code = document.getElementById("promoInput").value.trim().toUpperCase();
  if (!code) {
    showToast("Masukkan kode promo");
    return;
  }
  if (cart.length === 0) {
    showToast("Keranjang masih kosong");
    return;
  }

  try {
    if (APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
      // Fallback lokal
      if (code === "BYBFE10") {
        appliedPromo = { code: "BYBFE10", discount_percent: 10, min_order: 0 };
        renderCart();
        showToast("Kode promo diterapkan: 10%");
      } else {
        showToast("Kode promo tidak valid");
      }
      return;
    }

    const res = await fetch(`${APPS_SCRIPT_URL}?action=promo&code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (data.ok && data.valid) {
      appliedPromo = data;
      renderCart();
      showToast(`Kode promo diterapkan: ${data.discount_percent}%`);
    } else {
      appliedPromo = null;
      renderCart();
      showToast(data.error || "Kode promo tidak valid");
    }
  } catch (err) {
    showToast("Gagal cek promo");
  }
};

// Drawer open/close
document.getElementById("cartOpen").onclick = () => {
  document.getElementById("drawer").classList.add("open");
};
document.getElementById("cartClose").onclick = () => {
  document.getElementById("drawer").classList.remove("open");
};
document.getElementById("overlay").onclick = () => {
  document.getElementById("drawer").classList.remove("open");
};

// ========================================
// CHECKOUT
// ========================================
function whatsappLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.getElementById("whatsapp").href = whatsappLink(WA_TEMPLATE);
document.getElementById("footerWa").href = whatsappLink(WA_TEMPLATE);

document.getElementById("checkoutBtn").onclick = () => {
  if (cart.length === 0) {
    showToast("Keranjang masih kosong");
    return;
  }
  document.getElementById("checkoutModal").classList.add("open");
};

document.getElementById("modalCancel").onclick = () => {
  document.getElementById("checkoutModal").classList.remove("open");
};

document.getElementById("modalConfirm").onclick = async () => {
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const note = document.getElementById("customerNote").value.trim();

  const productsPayload = cart.map(c => ({
    id: c.id,
    name: c.name,
    price: c.price,
    qty: c.qty
  }));

  const discount = getDiscount();
  const total = getTotal();

  // Simpan order ke Google Sheets (jika sudah dikonfigurasi)
  let orderId = "";
  try {
    if (!APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "order",
          products: productsPayload,
          customer_name: name,
          customer_phone: phone,
          note: note,
          promo_code: appliedPromo ? appliedPromo.code : "",
          discount: discount
        })
      });
      const data = await res.json();
      if (data.ok) orderId = data.order_id || "";
    }
  } catch (err) {
    console.warn("Gagal simpan order ke Sheets:", err);
  }

  // Build WhatsApp message
  const lines = cart.map(c => `• ${c.name} x${c.qty} (${formatRp(c.price * c.qty)})`);
  let message = `Halo kak, aku mau pesan:\n\n${lines.join("\n")}`;
  message += `\n\nSubtotal: ${formatRp(getSubtotal())}`;
  if (discount > 0) message += `\nDiskon (${appliedPromo.code}): −${formatRp(discount)}`;
  message += `\n*Total: ${formatRp(total)}*`;
  if (name) message += `\n\nNama: ${name}`;
  if (phone) message += `\nWA: ${phone}`;
  if (note) message += `\nCatatan: ${note}`;
  if (orderId) message += `\nOrder ID: ${orderId}`;

  // Buka WhatsApp
  window.open(whatsappLink(message), "_blank");

  // Reset
  document.getElementById("checkoutModal").classList.remove("open");
  document.getElementById("drawer").classList.remove("open");
  cart = [];
  appliedPromo = null;
  document.getElementById("promoInput").value = "";
  document.getElementById("customerName").value = "";
  document.getElementById("customerPhone").value = "";
  document.getElementById("customerNote").value = "";
  renderCart();
  showToast(orderId ? `Order ${orderId} tercatat!` : "Silakan lanjut chat WhatsApp");
};

// ========================================
// NEWSLETTER
// ========================================
document.getElementById("newsletter").onsubmit = async event => {
  event.preventDefault();
  const email = document.getElementById("newsletterEmail").value.trim();
  if (!email) return;

  try {
    if (APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
      showToast("Terima kasih sudah berlangganan!");
      event.target.reset();
      return;
    }
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "subscribe", email })
    });
    const data = await res.json();
    showToast(data.message || (data.ok ? "Berhasil berlangganan!" : "Gagal, coba lagi"));
    if (data.ok) event.target.reset();
  } catch (err) {
    showToast("Gagal mengirim. Coba lagi nanti.");
  }
};

// ========================================
// TOAST
// ========================================
function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// ========================================
// KEYBOARD ESC
// ========================================
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    searchPanel.classList.remove("open");
    document.getElementById("drawer").classList.remove("open");
    document.getElementById("checkoutModal").classList.remove("open");
    navigation.classList.remove("open");
  }
});

// ========================================
// SWIPE SLIDER MOBILE
// ========================================
let touchStartX = 0;
track.addEventListener("touchstart", e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });
track.addEventListener("touchend", e => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 50) {
    if (diff < 0) goToSlide(index + 1);
    else goToSlide(index - 1);
  }
}, { passive: true });

// ========================================
// INIT
// ========================================
loadProducts();
