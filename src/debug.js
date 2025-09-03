// Debug için bu kodu src/debug.js olarak kaydet ve çalıştır

"use strict";
const puppeteer = require("puppeteer");

async function debugScraper() {
  const browser = await puppeteer.launch({ headless: false }); // Tarayıcıyı görünür yap
  const page = await browser.newPage();

  await page.goto("https://www.hepsiburada.com/asus-tuf-gaming-m3-gen-ii-aura-sync-rgb-8000-dpi-sensor-60-milyon-tiklama-omru-59-gram-hafif-tasarim-oyuncu-mouse-p-HBCV00004Z7585");
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Console'da tüm fiyat elementlerini göster
  const result = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    const priceElements = [];
    
    for (const el of allElements) {
      const text = el.textContent || el.innerText || '';
      if (text.includes('₺') || text.includes('TL')) {
        priceElements.push({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: text.trim().substring(0, 100)
        });
      }
    }
    
    return priceElements;
  });

  console.log("Sayfa üzerindeki tüm fiyat elementleri:");
  console.log(JSON.stringify(result, null, 2));

  // 30 saniye bekle ki sayfayı inceleyebilin
  await new Promise(resolve => setTimeout(resolve, 30000));
  await browser.close();
}

debugScraper();