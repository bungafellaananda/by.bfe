// ========================================
// byBFÉ — WEBSITE JAVASCRIPT
// ========================================

// Nomor WhatsApp
const WA_NUMBER = "6282269190930";

// Template pesan WhatsApp
const WA_TEMPLATE =
  "Halo kak aku mau pesan desain .... /.... pack ya;";


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

  button.setAttribute(
    "aria-label",
    `Slide ${i + 1}`
  );

  button.onclick = () => goToSlide(i);

  dots.appendChild(button);

});


function goToSlide(i) {

  index = (i + slides.length) % slides.length;

  track.style.transform =
    `translateX(-${index * 100}%)`;

  [...dots.children].forEach((button, number) => {

    button.classList.toggle(
      "active",
      number === index
    );

  });

  clearInterval(auto);

  auto = setInterval(() => {

    goToSlide(index + 1);

  }, 5000);

}


// Jalankan slider
goToSlide(0);


// Tombol slider sebelumnya
document.getElementById("prev").onclick = () => {

  goToSlide(index - 1);

};


// Tombol slider berikutnya
document.getElementById("next").onclick = () => {

  goToSlide(index + 1);

};


// ========================================
// MENU MOBILE
// ========================================

const menuButton =
  document.getElementById("menu");

const navigation =
  document.getElementById("nav");


menuButton.onclick = () => {

  navigation.classList.toggle("open");

};


// Tutup menu setelah memilih halaman
document.querySelectorAll("#nav a").forEach(link => {

  link.onclick = () => {

    navigation.classList.remove("open");

  };

});


// ========================================
// SEARCH
// ========================================

const searchPanel =
  document.getElementById("searchPanel");

const searchInput =
  document.getElementById("searchInput");

const searchResults =
  document.getElementById("searchResults");


// Buka search
document.getElementById("searchOpen").onclick = () => {

  searchPanel.classList.add("open");

  searchInput.focus();

};


// Tutup search
document.getElementById("searchClose").onclick = () => {

  searchPanel.classList.remove("open");

};


// Pencarian produk
searchInput.oninput = event => {

  const keyword =
    event.target.value
      .toLowerCase()
      .trim();


  const products =
    [...document.querySelectorAll(".product")];


  if (!keyword) {

    searchResults.innerHTML = "";

    return;

  }


  const found =
    products.filter(product => {

      return product.dataset.name
        .toLowerCase()
        .includes(keyword);

    });


  if (found.length) {

    searchResults.innerHTML =
      found
        .map(product =>
          `• ${product.dataset.name}`
        )
        .join("<br>");

  } else {

    searchResults.innerHTML =
      "Produk tidak ditemukan.";

  }

};


// ========================================
// LANGUAGE INDONESIA / ENGLISH
// ========================================

const translations = {

  id: {

    hero:
      "Temukan outfit modern dengan siluet clean, warna berkarakter, dan detail yang membuat gaya kamu terasa personal.",

    shop:
      "Lihat Koleksi →",

    discover:
      "Kenal byBFÉ",

    collection:
      "Koleksi pilihan untuk gaya sehari-hari, acara spesial, dan momen ketika kamu ingin tampil lebih percaya diri.",

    promo:
      "Nikmati potongan 10% untuk pembelian pertama dengan kode BYBFE10.",

    about:
      "byBFÉ menghadirkan outfit dengan pendekatan modern, minimalis, dan mudah dipadukan. Kami percaya gaya terbaik adalah gaya yang terasa nyaman dan tetap menunjukkan karakter pemakainya."

  },


  en: {

    hero:
      "Discover modern outfits with clean silhouettes, distinctive colors, and details that make your style feel personal.",

    shop:
      "Shop Collection →",

    discover:
      "Meet byBFÉ",

    collection:
      "Curated pieces for everyday style, special occasions, and moments when you want to feel more confident.",

    promo:
      "Enjoy 10% off your first order with code BYBFE10.",

    about:
      "byBFÉ creates modern, minimal, and easy-to-style outfits. We believe great style should feel comfortable while still expressing the wearer's character."

  }

};


// Tombol bahasa
document.querySelectorAll(".lang").forEach(button => {

  button.onclick = () => {

    const language =
      button.dataset.lang;


    // Aktifkan tombol
    document.querySelectorAll(".lang").forEach(item => {

      item.classList.toggle(
        "active",
        item === button
      );

    });


    // Ubah menu navbar
    document.querySelectorAll("#nav a")
      .forEach(link => {

        link.textContent =
          link.dataset[language];

      });


    // Ubah hero
    document.querySelector(
      '[data-copy="hero"]'
    ).textContent =
      translations[language].hero;


    // Ubah tombol collection
    document.querySelector(
      '[data-copy="shop"]'
    ).textContent =
      translations[language].shop;


    // Ubah tombol about
    document.querySelector(
      '[data-copy="discover"]'
    ).textContent =
      translations[language].discover;


    // Ubah deskripsi collection
    document.querySelector(
      '[data-copy="collection"]'
    ).textContent =
      translations[language].collection;


    // Ubah promo
    document.querySelector(
      '[data-copy="promo"]'
    ).innerHTML =
      translations[language]
        .promo
        .replace(
          "BYBFE10",
          "<strong>BYBFE10</strong>"
        );


    // Ubah about
    document.querySelector(
      '[data-copy="about"]'
    ).textContent =
      translations[language].about;


    // Placeholder search
    searchInput.placeholder =
      language === "id"
        ? "Cari outfit..."
        : "Search outfits...";

  };

});


// ========================================
// SHOPPING CART
// ========================================

let cart = [];

const drawer =
  document.getElementById("drawer");

const cartItems =
  document.getElementById("cartItems");


// Render keranjang
function renderCart() {

  const cartCount =
    document.getElementById("cartCount");

  const total =
    document.getElementById("total");


  // Jumlah item
  cartCount.textContent =
    cart.length;


  total.textContent =
    cart.length;


  // Jika kosong
  if (cart.length === 0) {

    cartItems.innerHTML =
      "<p>Keranjang masih kosong.</p>";

    return;

  }


  // Tampilkan produk
  cartItems.innerHTML =

    cart.map((item, i) => {

      return `
        <div class="cart-row">

          <span>
            ${item}
          </span>

          <button
            onclick="removeItem(${i})">

            Hapus

          </button>

        </div>
      `;

    }).join("");

}


// Hapus produk dari keranjang
window.removeItem = function(index) {

  cart.splice(index, 1);

  renderCart();

};


// ========================================
// TAMBAH PRODUK
// ========================================

document.querySelectorAll(".add")
  .forEach(button => {

    button.onclick = () => {

      const product =
        button.dataset.product;


      cart.push(product);


      renderCart();


      showToast(
        product +
        " ditambahkan ke keranjang"
      );

    };

  });


// ========================================
// BUKA CART
// ========================================

document.getElementById("cartOpen").onclick = () => {

  drawer.classList.add("open");

};


// Tutup cart
document.getElementById("cartClose").onclick = () => {

  drawer.classList.remove("open");

};


// Klik area luar cart
document.getElementById("overlay").onclick = () => {

  drawer.classList.remove("open");

};


// ========================================
// WHATSAPP
// ========================================

function whatsappLink(message) {

  return (
    `https://wa.me/${WA_NUMBER}` +
    `?text=${encodeURIComponent(message)}`
  );

}


// Floating WhatsApp
document.getElementById("whatsapp").href =
  whatsappLink(WA_TEMPLATE);


// ========================================
// CHECKOUT VIA WHATSAPP
// ========================================

document.getElementById("checkout").onclick =
  event => {

    // Kalau keranjang kosong
    if (cart.length === 0) {

      event.preventDefault();

      showToast(
        "Keranjang masih kosong"
      );

      return;

    }


    // Gabungkan produk
    const products =
      [...new Set(cart)]
        .join(", ");


    const message =
      `Halo kak aku mau pesan desain ${products} /${cart.length} pack ya;`;


    event.currentTarget.href =
      whatsappLink(message);

  };


// ========================================
// TOAST NOTIFICATION
// ========================================

function showToast(text) {

  const toast =
    document.getElementById("toast");


  toast.textContent =
    text;


  toast.classList.add("show");


  setTimeout(() => {

    toast.classList.remove("show");

  }, 1800);

}


// ========================================
// NEWSLETTER
// ========================================

document.getElementById("newsletter").onsubmit =
  event => {

    event.preventDefault();


    event.target.reset();


    showToast(
      "Terima kasih sudah berlangganan!"
    );

  };


// ========================================
// KEYBOARD ESC
// ========================================

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {

    searchPanel.classList.remove("open");

    drawer.classList.remove("open");

    navigation.classList.remove("open");

  }

});


// ========================================
// SWIPE SLIDER UNTUK HP
// ========================================

let touchStartX = 0;
let touchEndX = 0;


track.addEventListener("touchstart", event => {

  touchStartX =
    event.changedTouches[0].screenX;

});


track.addEventListener("touchend", event => {

  touchEndX =
    event.changedTouches[0].screenX;


  const distance =
    touchStartX - touchEndX;


  // Geser ke kiri
  if (distance > 50) {

    goToSlide(index + 1);

  }


  // Geser ke kanan
  if (distance < -50) {

    goToSlide(index - 1);

  }

});


// ========================================
// SELESAI
// ========================================

console.log(
  "byBFÉ website loaded successfully ✨"
);
