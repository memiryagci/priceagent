"use strict";

// priceChecker'dan runOnce fonksiyonunu alıyoruz
const { initPriceChecker } = require("./src/services/priceChecker");
const { runOnce } = initPriceChecker();

runOnce()
  .then(() => console.log("Test tamamlandı"))
  .catch(err => console.error("Hata:", err.message));
