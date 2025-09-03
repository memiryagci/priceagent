"use strict";

const { scrapePrice } = require("./scraper");

(async () => {
  const urls = [
    "https://www.hepsiburada.com/asus-tuf-gaming-m3-gen-ii-aura-sync-rgb-8000-dpi-sensor-60-milyon-tiklama-omru-59-gram-hafif-tasarim-oyuncu-mouse-p-HBCV00004Z7585",
    "https://www.hepsiburada.com/logitech-910-005823-g102-lightsync-black-8000dpi-6-tus-optik-rgb-siyah-kablolu-gaming-oyuncu-mouse-p-HBV00000V8BC3",
    "https://www.hepsiburada.com/spigen-45w-usb-c-hizli-sarj-aleti-orgu-sarj-kablo-samsung-pps-2-0-isi-dusurucu-gan-akim-korumali-pd-3-0-protokol-guc-adaptoru-super-hizli-sarj-iphone-android-ipad-macbook-type-c-ach02589-p-HBCV00002YY8JU?magaza=Hepsiburada",
    "https://www.hepsiburada.com/raks-kraus-sf-16-siyah-salinim-ozellikli-ayakli-vantilator-p-HBCV00008UNTFI",
    "https://www.hepsiburada.com/pusat-k3-pro-rgb-mekanik-turkce-kablolu-oyuncu-klavyesi-p-HBV00000YA59O"
  ];
  let found = false;
  for (const url of urls) {
    const price = await scrapePrice(url);
    if (price != null) {
      console.log(`Scraper başarılı! Fiyat: ${price} | URL: ${url}`);
      found = true;
      break;
    } else {
      console.log(`Fiyat bulunamadı -> ${url}`);
    }
  }
  if (!found) console.log("Tüm linklerde fiyat bulunamadı");
})();
