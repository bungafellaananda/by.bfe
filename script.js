// ============================================
// CONFIG — GANTI URL SETELAH DEPLOY APPS SCRIPT
// ============================================
const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// ============================================
// STATE
// ============================================
let cart = JSON.parse(localStorage.getItem('bybfe_cart') || '[]');
let promoDiscount = 0;

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartUI();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('cartBtn').onclick = () => {
    document.getElementById('cartSidebar').classList.add('open');
  };
  document.getElementById('closeCart').onclick = () => {
    document.getElementById('cartSidebar').classList.remove('open');
  };
  document.getElementById('checkoutBtn').onclick = () => {
    document.getElementById('checkoutModal').classList.add('open');
  };
  document.querySelector('.close-modal').onclick = () => {
    document.getElementById('checkoutModal').classList.remove('open');
  };

  document.getElementById('newsletterForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    const msg = document.getElementById('newsletterMessage');
    msg.textContent = 'Mengirim…';
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'newsletter', email })
      });
      const data = await res.json();
      msg.textContent = data.message || 'Berhasil!';
      if (data.success) document.getElementById('emailInput').value = '';
    } catch {
      msg.textContent = 'Gagal mengirim. Coba lagi.';
    }
  };

  document.getElementById('applyPromo').onclick = async () => {
    const code = document.getElementById('promoCode').value.trim();
    const msg = document.getElementById('promoMessage');
    if (!code) return;
    msg.textContent = 'Memeriksa…';
    try {
      const res = await fetch(`${API_URL}?action=validatePromo&code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.valid) {
        promoDiscount = data.discountPercent || 10;
        msg.textContent = `Kode valid! Diskon ${promoDiscount}% diterapkan.`;
        updateCartUI();
      } else {
        promoDiscount = 0;
        msg.textContent = 'Kode tidak valid atau sudah tidak aktif.';
        updateCartUI();
      }
    } catch {
      msg.textContent = 'Gagal memeriksa kode.';
    }
  };

  document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const msg = document.getElementById('orderMessage');
    if (cart.length === 0) {
      msg.textContent = 'Keranjang kosong.';
      return;
    }
    msg.textContent = 'Mengirim pesanan…';
    const orderData = {
      action: 'order',
      name: document.getElementById('orderName').value,
      email: document.getElementById('orderEmail').value,
      phone: document.getElementById('orderPhone').value,
      note: document.getElementById('orderNote').value,
      items: cart,
      total: calculateTotal(),
      promoCode: document.getElementById('promoCode').value || ''
    };
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      msg.textContent = data.message || 'Pesanan terkirim!';
      if (data.success) {
        cart = [];
        localStorage.removeItem('bybfe_cart');
        updateCartUI();
        document.getElementById('orderForm').reset();
        setTimeout(() => document.getElementById('checkoutModal').classList.remove('open'), 2000);
      }
    } catch {
      msg.textContent = 'Gagal mengirim. Coba lagi.';
    }
  };
}

// ============================================
// PRODUCTS
// ============================================
async function loadProducts() {
  const grid = document.getElementById('productGrid');
  try {
    const res = await fetch(`${API_URL}?action=products`);
    const products = await res.json();
    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = '<p class="loading">Belum ada produk.</p>';
      return;
    }
    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <img src="${p.imageUrl || 'https://via.placeholder.com/400x500?text=byBFE'}" alt="${p.name}" loading="lazy">
        <div class="product-info">
          <h4>${p.name}</h4>
          <div class="price">Rp ${Number(p.price).toLocaleString('id-ID')}</div>
          <button onclick="addToCart('${p.id}', '${escapeHtml(p.name)}', ${p.price})">Tambah ke Keranjang</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p class="loading">Gagal memuat koleksi. Pastikan API_URL sudah benar.</p>';
    console.error(err);
  }
}

function escapeHtml(str) {
  return String(str).replace(/'/g, "\\'");
}

// ============================================
// CART
// ============================================
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price: Number(price), qty: 1 });
  }
  localStorage.setItem('bybfe_cart', JSON.stringify(cart));
  updateCartUI();
  document.getElementById('cartSidebar').classList.add('open');
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsEl = document.getElementById('cartItems');
  if (cart.length === 0) {
    itemsEl.innerHTML = '<p style="color:#666">Keranjang kosong</p>';
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>${item.name} × ${item.qty}</div>
        <div>Rp ${(item.price * item.qty).toLocaleString('id-ID')}</div>
      </div>
    `).join('');
  }

  const total = calculateTotal();
  document.getElementById('cartTotal').textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function calculateTotal() {
  let subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (promoDiscount > 0) {
    subtotal = subtotal * (1 - promoDiscount / 100);
  }
  return Math.round(subtotal);
}
