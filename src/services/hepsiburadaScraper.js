"use strict";
const puppeteer = require("puppeteer");

// Hepsiburada fiyat çekme fonksiyonu
async function scrapeHepsiburadaPrice(page) {
  const result = await page.evaluate(() => {
    // 1. ÖNCE JSON-LD STRUCTURED DATA DENEYELİM (EN GÜVENİLİR)
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (let script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        if (data['@type'] === 'Product' && data.offers && data.offers.price) {
          const jsonPrice = parseFloat(data.offers.price);
          if (!isNaN(jsonPrice) && jsonPrice > 0) {
            console.log("✅ JSON-LD'den fiyat bulundu:", jsonPrice);
            return { price: jsonPrice, debug: { method: 'JSON-LD', price: jsonPrice } };
          }
        }
      } catch (e) {
        // JSON parse hatası, devam et
      }
    }

    // 2. SPESİFİK CSS SELEKTÖRLER (GÜNCEL - F12'DEN ALINAN)
    const selectors = [
      '[data-test-id="default-price"] .z7kokklsVwh0K5zFWjIO span',  // TAM YOLU - En spesifik
      '[data-test-id="default-price"] span',                        // Kısa yol
      '.z7kokklsVwh0K5zFWjIO span',                                // Class ile
      '[data-test-id="price"] span',                               // Ana price container
      '.foQSHpIYwZWy8nHeqapl span',                               // Parent class
      '.IMDzXKdZKh810YOI6k5Q span',                               // Alt parent
    ];

    console.log("Hepsiburada özel selektörler deneniyor...");

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || element.innerText || '';
        console.log(`✅ ${selector} bulundu: "${text}"`);
        
        // Fiyat formatını parse et (949,06 TL formatı)
        const match = text.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
        if (match && match[1]) {
          const priceValue = parseFloat(match[1].replace(/\./g, "").replace(",", "."));
          if (priceValue > 10 && priceValue < 50000) { // Makul fiyat aralığı
            console.log(`🎯 CSS Selector ile fiyat bulundu (${selector}):`, priceValue);
            return { price: priceValue, debug: { method: 'CSS-Selector', selector: selector, price: priceValue } };
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
        if (priceValue > 100 && priceValue < 50000) { // Genel ürün aralığı
          prices.push(priceValue);
        }
      }
    }

    // Debug bilgilerini topla
    const debugPageText = document.body.innerText;
    const lines839 = debugPageText.split('\n').filter(line => line.includes('839'));
    
    const debugInfo = {
      url: window.location.href,
      title: document.title,
      method: 'CSS-Fallback',
      allPrices: prices.sort((a, b) => a - b),
      lines839: lines839.slice(0, 5),
      finalPrice: prices.length > 0 ? Math.min(...prices) : null
    };
    
    if (prices.length > 0) {
      // Akıllı fiyat seçimi: 500 TL altındaki fiyatları filtrele (kargo, aksesuar vs.)
      const validPrices = prices.filter(price => price >= 500);
      
      let finalPrice;
      if (validPrices.length > 0) {
        finalPrice = Math.min(...validPrices);
      } else {
        // Eğer tüm fiyatlar 500'ün altındaysa en büyüğünü al
        finalPrice = Math.max(...prices);
      }
      
      debugInfo.validPrices = validPrices;
      debugInfo.finalPrice = finalPrice;
      
      return { price: finalPrice, debug: debugInfo };
    } else {
      return { price: null, debug: debugInfo };
    }
  });
  
  // Debug bilgilerini terminal'e yazdır
  console.log("🔍 Hepsiburada DEBUG:");
  console.log("- Sayfa URL:", result.debug.url);
  console.log("- Sayfa başlığı:", result.debug.title);
  console.log("- 📊 Kullanılan Method:", result.debug.method);
  if (result.debug.selector) {
    console.log("- 🎯 Kullanılan CSS Selector:", result.debug.selector);
  }
  if (result.debug.allPrices) {
    console.log("- Bulunan tüm fiyatlar:", result.debug.allPrices);
    console.log("- 500+ TL geçerli fiyatlar:", result.debug.validPrices);
    console.log("- 839 içeren satırlar:", result.debug.lines839);
  }
  console.log("- ✅ Seçilen fiyat:", result.debug.finalPrice || result.debug.price);
  
  return result.price;
}

async function scrapeHepsiburada(url) {
  if (!url || typeof url !== "string" || !url.includes("hepsiburada.com")) {
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

    console.log("🛒 Hepsiburada scraping başlıyor...");
    console.log("  📄 Sayfa yükleniyor...");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });

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
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (_) {}

    console.log("  ⏳ Fiyat elementleri yükleniyor...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    const price = await scrapeHepsiburadaPrice(page);

    console.log("📊 Hepsiburada sonucu:", price);
    await browser.close();
    return price || null;

  } catch (err) {
    console.error("  ❌ Hepsiburada scraper hatası:", err.message);
    if (browser) {
      try {
        await browser.close();
      } catch (_) {}
    }
    return null;
  }
}

module.exports = { scrapeHepsiburada };
