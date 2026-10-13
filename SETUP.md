# byBFÉ — Setup Google Sheets + Apps Script

Panduan lengkap agar website terhubung ke database gratis (Google Sheets).

---

## 1. Buat Google Spreadsheet

1. Buka [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**
2. Rename spreadsheet jadi **byBFE-Database**
3. Buat **4 sheet** dengan nama persis (case-sensitive):

### Sheet: `Products`
Baris 1 (header) — ketik persis:

```
id | name | price | category | color | tag | image_url | stock | active | description
```

Contoh data (baris 2 dst):

| id | name | price | category | color | tag | image_url | stock | active | description |
|----|------|-------|----------|-------|-----|-----------|-------|--------|-------------|
| 1 | Maroon Elara Set | 489000 | Set | Maroon | BESTSELLER | https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85 | 10 | TRUE | |
| 2 | Navy Aira Dress | 429000 | Dress | Navy | | https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85 | 8 | TRUE | |
| 3 | Ivory Noura Outer | 379000 | Outer | Ivory | NEW | https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=900&q=85 | 12 | TRUE | |
| 4 | Mahogany Raya Set | 459000 | Set | Mahogany | | https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=85 | 6 | TRUE | |

> **Catatan:** `price` dalam angka murni (tanpa Rp / titik). `active` harus `TRUE` supaya muncul di website. `tag` bisa diisi BESTSELLER / NEW / kosong.

### Sheet: `Orders`
Header:

```
timestamp | order_id | products | qty_total | subtotal | discount | total | customer_name | customer_phone | note | promo_code | status
```

(Biarkan kosong — data akan masuk otomatis saat ada order)

### Sheet: `Subscribers`
Header:

```
timestamp | email | source
```

### Sheet: `Promo`
Header:

```
code | discount_percent | active | min_order | expiry
```

Contoh:

| code | discount_percent | active | min_order | expiry |
|------|------------------|--------|-----------|--------|
| BYBFE10 | 10 | TRUE | 0 | |

---

## 2. Ambil Spreadsheet ID

Lihat URL spreadsheet:

```
https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit
                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                              ini Spreadsheet ID
```

Copy ID tersebut.

---

## 3. Setup Apps Script

1. Di spreadsheet → menu **Extensions → Apps Script**
2. Hapus semua kode default
3. Copy-paste seluruh isi file `apps-script/Code.gs` dari zip ini
4. Ganti baris ini:

```js
const SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
```

menjadi:

```js
const SPREADSHEET_ID = '1ABC...XYZ';  // ID yang kamu copy tadi
```

5. Klik **Save** (Ctrl+S)
6. Klik **Deploy → New deployment**
7. Settings:
   - Type: **Web app**
   - Description: `byBFE API v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Klik **Deploy**
9. Otorisasi (Authorize access) → pilih akun Google kamu → Advanced → Go to ... (unsafe) → Allow
10. **Copy Web App URL** yang muncul (bentuk: `https://script.google.com/macros/s/XXXX/exec`)

---

## 4. Hubungkan ke Website

1. Buka file `script.js`
2. Ganti baris ini:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID/exec";
```

menjadi URL yang kamu copy di langkah 3.10.

3. Simpan.

---

## 5. Deploy ke GitHub Pages

1. Buat repo baru di GitHub (misal: `bybfe`)
2. Upload semua file di folder ini (kecuali folder `apps-script` kalau mau — opsional, hanya untuk backup)
3. Settings → Pages → Source: Deploy from branch `main` / `root`
4. Domain custom (opsional): isi `by.bybfe.my.id` di CNAME sudah ada

Setelah live, website akan:
- Load produk dari Google Sheet
- Simpan newsletter ke sheet Subscribers
- Simpan order ke sheet Orders
- Validasi kode promo dari sheet Promo

---

## 6. Cara Update Data (setelah live)

| Mau update | Lakukan di |
|------------|------------|
| Tambah / edit produk | Sheet **Products** → isi baris baru / ubah → refresh website |
| Nonaktifkan produk | Ubah kolom `active` jadi `FALSE` |
| Lihat order masuk | Sheet **Orders** |
| Lihat subscriber | Sheet **Subscribers** |
| Tambah kode promo | Sheet **Promo** |

Tidak perlu push kode ke GitHub lagi untuk update produk/promo/order.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Produk tidak muncul | Cek `APPS_SCRIPT_URL` sudah benar + Sheet Products `active=TRUE` |
| CORS / failed fetch | Pastikan Web App access = **Anyone** |
| Order tidak masuk | Cek di Apps Script → Executions (ada log error?) |
| Promo tidak valid | Pastikan `active=TRUE` dan `code` huruf besar di Sheet |
| Fallback lokal | Jika URL masih berisi `PASTE_YOUR`, website pakai 4 produk hardcoded (aman untuk testing) |

---

## Keamanan (catatan)

- Web App "Anyone" = siapapun bisa memanggil endpoint. Untuk scale kecil (toko fashion) ini cukup aman.
- Jangan taruh data sensitif (password, dll) di Sheet.
- Kalau mau lebih ketat nanti, bisa tambah secret token sederhana di Apps Script.
