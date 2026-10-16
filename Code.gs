// ============================================================
// byBFÉ Apps Script Backend
// Copy seluruh isi file ini ke Google Apps Script editor
// ============================================================

const props = PropertiesService.getScriptProperties();
const SPREADSHEET_ID = props.getProperty('SPREADSHEET_ID');

function doGet(e) {
  const action = e.parameter.action || 'products';
  try {
    if (action === 'products') {
      return jsonResponse(getProducts());
    }
    if (action === 'validatePromo') {
      return jsonResponse(validatePromo(e.parameter.code));
    }
    return jsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'newsletter') {
      return jsonResponse(addNewsletter(data.email));
    }
    if (data.action === 'order') {
      return jsonResponse(addOrder(data));
    }
    return jsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function getProducts() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('products_v1');
  if (cached) return JSON.parse(cached);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Products');
  if (!sheet) throw new Error('Sheet Products tidak ditemukan');

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0].map(h => String(h).trim());
  const products = data.slice(1)
    .filter(row => {
      const activeIdx = headers.indexOf('active');
      if (activeIdx === -1) return true;
      const val = row[activeIdx];
      return val === true || val === 'TRUE' || val === 'true' || val === 1;
    })
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

  cache.put('products_v1', JSON.stringify(products), 300); // cache 5 menit
  return products;
}

function addNewsletter(email) {
  if (!email || !String(email).includes('@')) {
    return { success: false, message: 'Email tidak valid' };
  }
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Newsletter');
  if (!sheet) throw new Error('Sheet Newsletter tidak ditemukan');
  sheet.appendRow([new Date(), email, 'website']);
  return { success: true, message: 'Terima kasih, kamu sudah terdaftar!' };
}

function addOrder(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Orders');
  if (!sheet) throw new Error('Sheet Orders tidak ditemukan');

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.phone || '',
    JSON.stringify(data.items || []),
    data.total || 0,
    data.promoCode || '',
    data.note || '',
    'pending'
  ]);

  // Opsional: kirim email notifikasi
  // MailApp.sendEmail('email-kamu@gmail.com', 'Pesanan Baru byBFÉ', JSON.stringify(data, null, 2));

  return { success: true, message: 'Pesanan diterima! Kami akan menghubungi kamu segera.' };
}

function validatePromo(code) {
  if (!code) return { valid: false };
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Promos');
  if (!sheet) return { valid: false };

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { valid: false };

  const headers = data[0].map(h => String(h).trim());
  const codeIdx = headers.indexOf('code');
  const activeIdx = headers.indexOf('active');
  const discIdx = headers.indexOf('discountPercent');

  if (codeIdx === -1) return { valid: false };

  for (let i = 1; i < data.length; i++) {
    const rowCode = String(data[i][codeIdx] || '').toUpperCase();
    const isActive = activeIdx === -1 ? true : (data[i][activeIdx] === true || data[i][activeIdx] === 'TRUE' || data[i][activeIdx] === 'true');
    if (rowCode === String(code).toUpperCase() && isActive) {
      return {
        valid: true,
        discountPercent: discIdx >= 0 ? Number(data[i][discIdx]) || 10 : 10
      };
    }
  }
  return { valid: false };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// SETUP AWAL (jalankan sekali jika perlu)
// ============================================================
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Products
  let sheet = ss.getSheetByName('Products') || ss.insertSheet('Products');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'collection', 'name', 'price', 'imageUrl', 'description', 'stock', 'active']);
    sheet.appendRow(['daily-muse-01', 'Daily Muse', 'Clean Daily Shirt', 289000, '', 'Outfit harian minimalis', 10, true]);
  }

  // Newsletter
  sheet = ss.getSheetByName('Newsletter') || ss.insertSheet('Newsletter');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['timestamp', 'email', 'source']);
  }

  // Orders
  sheet = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['timestamp', 'name', 'email', 'phone', 'items', 'total', 'promoCode', 'note', 'status']);
  }

  // Promos
  sheet = ss.getSheetByName('Promos') || ss.insertSheet('Promos');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['code', 'discountPercent', 'active', 'maxUses']);
    sheet.appendRow(['BYBFE10', 10, true, 100]);
  }

  Logger.log('Setup selesai. Isi data produk di sheet Products.');
}
