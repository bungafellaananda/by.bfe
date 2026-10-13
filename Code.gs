/**
 * byBFÉ — Google Apps Script Backend
 * ==================================
 * Deploy as Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Spreadsheet must have 4 sheets: Products, Orders, Subscribers, Promo
 * (lihat SETUP.md untuk struktur kolom)
 */

const SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE'; // ganti setelah buat Sheet

function doGet(e) {
  const action = (e.parameter.action || '').toLowerCase();
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (action === 'products') {
      return output.setContent(JSON.stringify(getProducts()));
    }
    if (action === 'promo') {
      const code = (e.parameter.code || '').toUpperCase().trim();
      return output.setContent(JSON.stringify(checkPromo(code)));
    }
    return output.setContent(JSON.stringify({ ok: false, error: 'Unknown action' }));
  } catch (err) {
    return output.setContent(JSON.stringify({ ok: false, error: String(err) }));
  }
}

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const action = (data.action || '').toLowerCase();

    if (action === 'subscribe') {
      return output.setContent(JSON.stringify(addSubscriber(data.email)));
    }
    if (action === 'order') {
      return output.setContent(JSON.stringify(addOrder(data)));
    }
    return output.setContent(JSON.stringify({ ok: false, error: 'Unknown action' }));
  } catch (err) {
    return output.setContent(JSON.stringify({ ok: false, error: String(err) }));
  }
}

/* ---------- Helpers ---------- */

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function sheetToObjects(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim().toLowerCase());
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

/* ---------- Products ---------- */

function getProducts() {
  const rows = sheetToObjects(getSheet('Products'));
  const products = rows
    .filter(r => String(r.active).toUpperCase() === 'TRUE' || r.active === true)
    .map(r => ({
      id: String(r.id || ''),
      name: String(r.name || ''),
      price: Number(r.price) || 0,
      category: String(r.category || ''),
      color: String(r.color || ''),
      tag: String(r.tag || ''),
      image: String(r.image_url || r.image || ''),
      stock: Number(r.stock) || 0,
      description: String(r.description || '')
    }));
  return { ok: true, products };
}

/* ---------- Promo ---------- */

function checkPromo(code) {
  if (!code) return { ok: false, valid: false, error: 'Kode kosong' };
  const rows = sheetToObjects(getSheet('Promo'));
  const found = rows.find(r => String(r.code).toUpperCase() === code);
  if (!found) return { ok: true, valid: false, error: 'Kode tidak ditemukan' };

  const active = String(found.active).toUpperCase() === 'TRUE' || found.active === true;
  if (!active) return { ok: true, valid: false, error: 'Kode tidak aktif' };

  if (found.expiry) {
    const exp = new Date(found.expiry);
    if (exp < new Date()) return { ok: true, valid: false, error: 'Kode sudah kadaluarsa' };
  }

  return {
    ok: true,
    valid: true,
    code: String(found.code).toUpperCase(),
    discount_percent: Number(found.discount_percent) || 0,
    min_order: Number(found.min_order) || 0
  };
}

/* ---------- Subscribers ---------- */

function addSubscriber(email) {
  email = String(email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Email tidak valid' };
  }

  const sheet = getSheet('Subscribers');
  const existing = sheetToObjects(sheet).map(r => String(r.email).toLowerCase());
  if (existing.includes(email)) {
    return { ok: true, message: 'Email sudah terdaftar' };
  }

  sheet.appendRow([new Date(), email, 'website']);
  return { ok: true, message: 'Berhasil berlangganan' };
}

/* ---------- Orders ---------- */

function addOrder(data) {
  const products = data.products || [];
  if (!Array.isArray(products) || products.length === 0) {
    return { ok: false, error: 'Keranjang kosong' };
  }

  const orderId = 'BF' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyMMddHHmmss');
  const qtyTotal = products.reduce((s, p) => s + (Number(p.qty) || 1), 0);
  const subtotal = products.reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.qty) || 1), 0);
  const discount = Number(data.discount) || 0;
  const total = Math.max(0, subtotal - discount);

  const productsStr = products.map(p => `${p.name} x${p.qty || 1}`).join(', ');

  getSheet('Orders').appendRow([
    new Date(),
    orderId,
    productsStr,
    qtyTotal,
    subtotal,
    discount,
    total,
    String(data.customer_name || ''),
    String(data.customer_phone || ''),
    String(data.note || ''),
    String(data.promo_code || ''),
    'Pending'
  ]);

  return { ok: true, order_id: orderId, total: total };
}
