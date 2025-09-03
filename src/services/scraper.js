"use strict";
const puppeteer = require("puppeteer");

async function scrapePrice(url) {
  if (!url || typeof url !== "string") return null;

  // Site tipini belirle
  const isHepsiburada = url.includes("hepsiburada.com");
  const isN11 = url.includes("n11.com");
  
  if (!isHepsiburada && !isN11) {
    console.log("❌ Desteklenmeyen site");
    return null;
  }

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    );
    await page.setViewport({ width: 1366, height: 768 });

    console.log("  📄 Sayfa yükleniyor...");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Consent banner kapatma
    try {
      await page.evaluate(() => {
        const clickByText = (t) => {
          const btns = Array.from(document.querySelectorAll("button, [role='button'], a"));
          const el = btns.find(b => (b.innerText || "").toLowerCase().includes(t));
          if (el) el.click();
        };
        clickByText("kabul");
        clickByText("accept");
        clickByText("onayla");
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (_) {}

    console.log("  ⏳ Fiyat elementleri yükleniyor...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    let price = null;

    if (isHepsiburada) {
      price = await scrapeHepsiburadaPrice(page);
    } else if (isN11) {
      price = await scrapeN11Price(page);
    }

    await browser.close();
    return price || null;

  } catch (err) {
    console.error("  ❌ Scraper hatası:", err.message);
    if (browser) {
      try {
        await browser.close();
      } catch (_) {}
    }
    return null;
  }
}

// Hepsiburada fiyat çekme fonksiyonu
async function scrapeHepsiburadaPrice(page) {
  return await page.evaluate(() => {
    // Öncelik sırasına göre selektörler (debug sonuçlarından)
    const selectors = [
      '.bWwoI8vknB6COlRVbpRj',  // Ana indirimli fiyat
      '.Wzmo_7GC39Nf0y3BWB1C',  // Sepete özel fiyat container
      '.foQSHpIYwZWy8nHeqapl .bWwoI8vknB6COlRVbpRj', // Daha spesifik
    ];

    console.log("Hepsiburada özel selektörler deneniyor...");

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || element.innerText || '';
        console.log(`${selector} bulundu: "${text}"`);
        
        // Sadece sayıları ve TL'yi al
        const match = text.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
        if (match && match[1]) {
          const priceValue = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
          if (priceValue > 10 && priceValue < 50000) { // Makul fiyat aralığı
            return priceValue;
          }
        }
      }
    }

    // Eğer spesifik selektörler çalışmazsa, "Sepete özel fiyat" textini ara
    console.log("Sepete özel fiyat aranıyor...");
    const specialPriceElements = Array.from(document.querySelectorAll('*')).filter(el => 
      (el.textContent || '').includes('Sepete özel fiyat')
    );

    for (const el of specialPriceElements) {
      const text = el.textContent || '';
      console.log(`Sepete özel fiyat elementi: "${text.substring(0, 100)}"`);
      
      // "797,05 TL" gibi fiyatı bul
      const match = text.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*TL/);
      if (match && match[1]) {
        const priceValue = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
        if (priceValue > 10 && priceValue < 50000) {
          return priceValue;
        }
      }
    }

    // Son çare: Sayfadaki en küçük makul fiyatı bul (diğer satıcıları hariç tut)
    console.log("Genel fiyat arama...");
    const pageText = document.body.innerText;
    const priceMatches = [...pageText.matchAll(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*TL/g)];
    const prices = [];

    for (const match of priceMatches) {
      if (match[1]) {
        const priceValue = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
        if (priceValue > 100 && priceValue < 10000) { // Mouse için makul aralık
          prices.push(priceValue);
        }
      }
    }

    console.log("Bulunan tüm fiyatlar:", prices.sort((a, b) => a - b));
    
    // En küçük 3 fiyattan birincisini al (genelde ana ürün fiyatı)
    return prices.length > 0 ? Math.min(...prices) : null;
  });
}

// N11 fiyat çekme fonksiyonu
async function scrapeN11Price(page) {
  return await page.evaluate(() => {
    console.log("N11 fiyat selektörleri deneniyor...");
    
    // N11 için olası selektörler
    const selectors = [
      '.newPrice',                    // Ana fiyat
      '.priceContainer .newPrice',    // Fiyat container içindeki yeni fiyat
      '.unf-p-summary-price-current', // Güncel fiyat
      '.price',                       // Genel fiyat
      '[class*="price"]',             // Fiyat içeren sınıf
      '.productPrice',                // Ürün fiyatı
      '.currentPrice'                 // Mevcut fiyat
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || element.innerText || '';
        console.log(`${selector} bulundu: "${text}"`);
        
        // N11'de fiyat formatı: "1.234,56 TL" veya "1234,56 TL"
        const match = text.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
        if (match && match[1]) {
          const priceValue = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
          if (priceValue > 10 && priceValue < 50000) {
            return priceValue;
          }
        }
      }
    }

    // JSON-LD structured data'dan fiyat çekmeyi dene
    console.log("N11 JSON-LD aranıyor...");
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        if (data.offers && data.offers.price) {
          const priceValue = parseFloat(data.offers.price);
          if (priceValue > 10 && priceValue < 50000) {
            return priceValue;
          }
        }
      } catch (e) {
        // JSON parse hatası, devam et
      }
    }

    // Son çare: Sayfadaki "TL" içeren fiyatları bul
    console.log("N11 genel fiyat arama...");
    const pageText = document.body.innerText;
    const priceMatches = [...pageText.matchAll(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*TL/g)];
    const prices = [];

    for (const match of priceMatches) {
      if (match[1]) {
        const priceValue = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
        if (priceValue > 100 && priceValue < 10000) {
          prices.push(priceValue);
        }
      }
    }

    console.log("N11 bulunan fiyatlar:", prices.sort((a, b) => a - b));
    return prices.length > 0 ? Math.min(...prices) : null;
  });
}

module.exports = { scrapePrice };