"use strict";

const cron = require("node-cron");
const { Product, User, PriceHistory } = require("../models");
const { sendMail } = require("../config/mailer");
const { scrapePrice } = require("./scraper");

// Basit fiyat çekici (örnek): sabit veya pseudo-random değer döndürür
async function fetchCurrentPrice(productUrl) {
  // Gerçek senaryoda axios/cheerio ile scraping ya da API çağrısı yapılır
  // Burada deterministik olması için URL uzunluğuna göre pseudo fiyat üretelim
  const base = 100 + (productUrl ? productUrl.length % 200 : 0);
  return Number((base + Math.random() * 20).toFixed(2));
}

async function checkAllProductsOnce() {
  const products = await Product.findAll();
  console.log(`[cron] ${products.length} ürün kontrol edilecek`);

  for (const product of products) {
    try {
      // Öncelik: scraper. Scraper sonuç vermezse fallback mock hesap
      let currentPrice = await scrapePrice(product.url);
      if (currentPrice === null || currentPrice === undefined) {
        currentPrice = await fetchCurrentPrice(product.url);
      }
      console.log(`[cron] Ürün #${product.id} (${product.name}) fiyat=${currentPrice}, hedef=${product.targetPrice}`);

      // Çoklu site örneği: tek site mock'u - ileride genişletilebilir
      const site = product.url.includes("hepsiburada.com") ? "hepsiburada" : "generic";

      // PriceHistory kaydı
      await PriceHistory.create({
        productId: product.id,
        site,
        price: currentPrice,
        date: new Date(),
      });

      // En düşük fiyatı güncelle
      const [minRow] = await Product.sequelize.query(
        "SELECT MIN(price) AS minPrice FROM PriceHistories WHERE productId = :pid",
        { replacements: { pid: product.id } }
      );
      const minPrice = minRow && minRow[0] ? minRow[0].minPrice : null;
      if (minPrice !== null && minPrice !== undefined) {
        product.currentLowestPrice = minPrice;
        await product.save();
      }

      if (currentPrice <= product.targetPrice) {
        // İlgili kullanıcının email'ini bul
        const user = await User.findByPk(product.userId);
        if (!user || !user.email) {
          console.warn(`[cron] Kullanıcı bulunamadı veya email yok. userId=${product.userId}`);
          continue;
        }

        await sendMail(
          user.email,
          `Fiyat Alarmı: ${product.name}`,
          `${product.name} için fiyat ${currentPrice} oldu. Hedef fiyatınız: ${product.targetPrice}. URL: ${product.url}`
        );
        console.log(`[cron] Alarm gönderildi: user=${user.email}, productId=${product.id}`);
      } else {
        console.log(`[cron] Alarm yok: productId=${product.id}`);
      }
    } catch (err) {
      console.error(`[cron] Ürün kontrol hatası productId=${product.id}:`, err.message);
    }
  }
}

function initPriceChecker() {
  // Her 10 dakikada bir
  const task = cron.schedule("*/10 * * * *", async () => {
    console.log(`[cron] Çalıştı: ${new Date().toISOString()}`);
    await checkAllProductsOnce();
  });

  return { task, runOnce: checkAllProductsOnce };
}

module.exports = { initPriceChecker, fetchCurrentPrice };


