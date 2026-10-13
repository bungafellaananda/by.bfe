# byBFÉ — Modern Outfit Website

Website fashion brand byBFÉ dengan database gratis via **Google Sheets + Apps Script**.

## Fitur

- Katalog produk dinamis (dari Google Sheet)
- Keranjang + qty + stok
- Kode promo (validasi dari Sheet)
- Checkout via WhatsApp + simpan order ke Sheet
- Newsletter → tersimpan di Sheet
- Bilingual ID / EN
- Responsive + slider + search

## Cara Setup

Baca file **SETUP.md** (langkah demi langkah).

Singkatnya:
1. Buat Google Spreadsheet (4 sheet: Products, Orders, Subscribers, Promo)
2. Deploy Apps Script sebagai Web App
3. Paste URL Web App ke `script.js` → `APPS_SCRIPT_URL`
4. Upload ke GitHub Pages

## File penting

| File | Keterangan |
|------|------------|
| `index.html` | Halaman utama |
| `script.js` | Logic + koneksi ke Apps Script |
| `style.css` | Styling |
| `apps-script/Code.gs` | Backend (copy ke Google Apps Script) |
| `SETUP.md` | Panduan setup lengkap |

## Domain

CNAME sudah diset ke `by.bybfe.my.id`
