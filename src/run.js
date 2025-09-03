"use strict";
const { comparePrices } = require("./priceCompare.js");

(async () => {
  // Karşılaştırılacak ürün bilgileri
  const productName = "Logitech G213 Prodigy RGB Gaming Klavye";
  const urls = [
    "https://www.hepsiburada.com/logitech-g213-prodigy-rgb-turkce-gaming-klavye-920-008094-p-HBV00000247UE",
    "https://www.n11.com/urun/logitech-g213-prodigy-920-008094-usb-kablolu-rgb-aydinlatmali-oyuncu-turkce-q-klavye-61097"
  ];

  try {
    await comparePrices(productName, urls);
  } catch (error) {
    console.error("❌ Fiyat karşılaştırma hatası:", error.message);
  }
})();