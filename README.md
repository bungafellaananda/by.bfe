# byBFÉ — Modern Outfit (GitHub Pages + Google Sheets)

Package siap deploy untuk situs fashion byBFÉ dengan backend Google Sheets + Apps Script.

## Isi Package

```
bybfe-deploy/
├── index.html          # Halaman utama
├── styles.css          # Styling modern
├── script.js           # Logika frontend + API call
├── appscript/
│   └── Code.gs         # Kode Apps Script (copy-paste ke editor)
└── README.md           # Panduan lengkap
```

## Cara Deploy

### 1. Frontend (GitHub Pages)
1. Unzip folder ini.
2. Upload `index.html`, `styles.css`, `script.js` ke repository GitHub Pages kamu.
3. Setelah Apps Script selesai, ganti `API_URL` di `script.js`.

### 2. Backend (Google Sheets + Apps Script)
Ikuti panduan di `README.md` dan file `appscript/Code.gs`.

---

**Catatan**: Tidak ada secret di frontend. Spreadsheet ID disimpan di Script Properties.
