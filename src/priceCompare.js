"use strict";
const { scrapePrice } = require("./services/scraper.js");

// Fiyat karşılaştırma fonksiyonu
async function comparePrices(productName, urls) {
  console.log(`🔍 ${productName} için fiyat karşılaştırması başlıyor...\n`);
  
  const results = [];
  
  for (const url of urls) {
    const siteName = getSiteName(url);
    console.log(`📊 ${siteName} kontrol ediliyor...`);
    
    try {
      const startTime = Date.now();
      const price = await scrapePrice(url);
      const duration = Date.now() - startTime;
      
      if (price !== null) {
        console.log(`✅ ${siteName}: ${price} TL (${duration}ms)\n`);
        results.push({
          site: siteName,
          price: price,
          url: url,
          duration: duration
        });
      } else {
        console.log(`❌ ${siteName}: Fiyat bulunamadı (${duration}ms)\n`);
        results.push({
          site: siteName,
          price: null,
          url: url,
          duration: duration
        });
      }
    } catch (error) {
      console.log(`❌ ${siteName}: Hata - ${error.message}\n`);
      results.push({
        site: siteName,
        price: null,
        url: url,
        error: error.message
      });
    }
  }
  
  // Sonuçları analiz et ve göster
  displayResults(productName, results);
  
  return results;
}

// Site adını URL'den çıkar
function getSiteName(url) {
  if (url.includes("hepsiburada.com")) return "Hepsiburada";
  if (url.includes("n11.com")) return "N11";
  return "Bilinmeyen Site";
}

// Sonuçları güzel bir formatta göster
function displayResults(productName, results) {
  console.log("=".repeat(60));
  console.log(`📋 ${productName} - FİYAT KARŞILAŞTIRMA SONUÇLARI`);
  console.log("=".repeat(60));
  
  const validPrices = results.filter(r => r.price !== null);
  
  if (validPrices.length === 0) {
    console.log("❌ Hiçbir siteden fiyat alınamadı!");
    return;
  }
  
  // Fiyatları sırala (düşükten yükseğe)
  validPrices.sort((a, b) => a.price - b.price);
  
  console.log("\n🏆 FİYAT SIRALAMASI:");
  validPrices.forEach((result, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "📍";
    const bestPrice = index === 0 ? " ⭐ EN UYGUN FİYAT!" : "";
    console.log(`${medal} ${result.site}: ${result.price} TL${bestPrice}`);
  });
  
  // Fiyat farkı analizi
  if (validPrices.length > 1) {
    const cheapest = validPrices[0];
    const mostExpensive = validPrices[validPrices.length - 1];
    const difference = mostExpensive.price - cheapest.price;
    const percentageDiff = ((difference / cheapest.price) * 100).toFixed(1);
    
    console.log("\n💰 FİYAT ANALİZİ:");
    console.log(`En ucuz: ${cheapest.site} - ${cheapest.price} TL`);
    console.log(`En pahalı: ${mostExpensive.site} - ${mostExpensive.price} TL`);
    console.log(`Fark: ${difference.toFixed(2)} TL (%${percentageDiff})`);
    
    if (difference > 50) {
      console.log(`💡 ${cheapest.site}'dan alarak ${difference.toFixed(2)} TL tasarruf edebilirsiniz!`);
    }
  }
  
  // Başarısız siteler
  const failedSites = results.filter(r => r.price === null);
  if (failedSites.length > 0) {
    console.log("\n⚠️  FİYAT ALINAMAYAN SİTELER:");
    failedSites.forEach(result => {
      console.log(`❌ ${result.site}: ${result.error || 'Fiyat bulunamadı'}`);
    });
  }
  
  console.log("\n" + "=".repeat(60));
}

module.exports = { comparePrices };
