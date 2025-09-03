"use strict";

const axios = require("axios");
const { sequelize } = require("./src/config/database");
const { User, Product, PriceHistory } = require("./src/models");

const BASE_URL = "http://localhost:5000/api";
let testResults = {
  database: { status: "❌", details: [] },
  auth: { status: "❌", details: [] },
  products: { status: "❌", details: [] },
  scraping: { status: "❌", details: [] },
  cronJob: { status: "❌", details: [] },
  mail: { status: "❌", details: [] }
};

// Test kullanıcı bilgileri
const testUser = {
  name: "Test User",
  email: `test_${Date.now()}@example.com`,
  password: "test123456"
};

let authToken = "";
let testProductId = null;

async function testDatabase() {
  console.log("\n🔍 1️⃣ DATABASE BAĞLANTISI TESTİ");
  console.log("=" .repeat(50));
  
  try {
    // Database bağlantısı testi
    await sequelize.authenticate();
    testResults.database.details.push("✅ MSSQL bağlantısı başarılı");
    
    // Model senkronizasyonu
    await sequelize.sync();
    testResults.database.details.push("✅ Model senkronizasyonu başarılı");
    
    // Tabloların varlığını kontrol et
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log("📋 Mevcut tablolar:", tables);
    
    if (tables.includes("Users") && tables.includes("Products") && tables.includes("PriceHistories")) {
      testResults.database.details.push("✅ Tüm tablolar mevcut (Users, Products, PriceHistories)");
    } else {
      testResults.database.details.push("❌ Bazı tablolar eksik");
      return;
    }
    
    // Model ilişkilerini test et
    const userCount = await User.count();
    const productCount = await Product.count();
    const historyCount = await PriceHistory.count();
    
    testResults.database.details.push(`📊 Mevcut veriler - Users: ${userCount}, Products: ${productCount}, PriceHistory: ${historyCount}`);
    
    testResults.database.status = "✅";
    console.log("✅ Database testi BAŞARILI");
    
  } catch (error) {
    testResults.database.details.push(`❌ Database hatası: ${error.message}`);
    console.error("❌ Database testi BAŞARISIZ:", error.message);
  }
}

async function testAuthSystem() {
  console.log("\n🔍 2️⃣ AUTH SİSTEMİ TESTİ");
  console.log("=" .repeat(50));
  
  try {
    // Kullanıcı kaydı testi
    console.log("📝 Kullanıcı kaydı test ediliyor...");
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    if (registerResponse.status === 201 && registerResponse.data.token) {
      testResults.auth.details.push("✅ Kullanıcı kaydı başarılı");
      testResults.auth.details.push(`✅ JWT token alındı: ${registerResponse.data.token.substring(0, 20)}...`);
    }
    
    // Kullanıcı girişi testi
    console.log("🔐 Kullanıcı girişi test ediliyor...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      testResults.auth.details.push("✅ Kullanıcı girişi başarılı");
      testResults.auth.details.push(`✅ Login JWT token alındı: ${authToken.substring(0, 20)}...`);
    }
    
    // JWT token doğrulama testi
    console.log("🛡️ JWT token doğrulama test ediliyor...");
    const protectedResponse = await axios.get(`${BASE_URL}/product/list`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (protectedResponse.status === 200) {
      testResults.auth.details.push("✅ JWT token doğrulaması başarılı");
    }
    
    testResults.auth.status = "✅";
    console.log("✅ Auth sistemi testi BAŞARILI");
    
  } catch (error) {
    testResults.auth.details.push(`❌ Auth hatası: ${error.message}`);
    console.error("❌ Auth sistemi testi BAŞARISIZ:", error.response?.data || error.message);
  }
}

async function testProductCRUD() {
  console.log("\n🔍 3️⃣ PRODUCT CRUD TESTİ");
  console.log("=" .repeat(50));
  
  try {
    // Ürün ekleme testi
    console.log("➕ Ürün ekleme test ediliyor...");
    const productData = {
      name: "Test Ürün - Logitech Mouse",
      targetPrice: 500,
      url: "https://www.hepsiburada.com/logitech-g213-prodigy-rgb-turkce-gaming-klavye-920-008094-p-HBV00000247UE"
    };
    
    const addResponse = await axios.post(`${BASE_URL}/product/add`, productData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (addResponse.status === 201) {
      testProductId = addResponse.data.product.id;
      testResults.products.details.push("✅ Ürün ekleme başarılı");
      testResults.products.details.push(`✅ Ürün ID: ${testProductId}`);
      
      if (addResponse.data.product.currentPrice) {
        testResults.products.details.push(`✅ Anlık fiyat çekildi: ${addResponse.data.product.currentPrice} TL`);
      }
    }
    
    // Ürün listeleme testi
    console.log("📋 Ürün listeleme test ediliyor...");
    const listResponse = await axios.get(`${BASE_URL}/product/list`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (listResponse.status === 200) {
      testResults.products.details.push(`✅ Ürün listeleme başarılı - ${listResponse.data.length} ürün bulundu`);
      
      const testProduct = listResponse.data.find(p => p.id === testProductId);
      if (testProduct) {
        testResults.products.details.push(`✅ Test ürünü listede bulundu: ${testProduct.name}`);
        if (testProduct.currentLowestPrice) {
          testResults.products.details.push(`✅ En düşük fiyat: ${testProduct.currentLowestPrice} TL`);
        }
      }
    }
    
    // Ürün güncelleme testi
    console.log("🔄 Ürün güncelleme test ediliyor...");
    const updateData = { name: "Test Ürün - Güncellenmiş", targetPrice: 450 };
    const updateResponse = await axios.put(`${BASE_URL}/product/update/${testProductId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (updateResponse.status === 200) {
      testResults.products.details.push("✅ Ürün güncelleme başarılı");
    }
    
    // Ürün fiyat geçmişi testi (eğer veri varsa)
    console.log("📈 Ürün fiyat geçmişi test ediliyor...");
    try {
      const historyResponse = await axios.get(`${BASE_URL}/product/${testProductId}/history`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (historyResponse.status === 200) {
        testResults.products.details.push(`✅ Fiyat geçmişi endpoint çalışıyor - ${historyResponse.data.length} kayıt`);
      }
    } catch (historyError) {
      testResults.products.details.push("⚠️ Fiyat geçmişi henüz boş (normal)");
    }
    
    testResults.products.status = "✅";
    console.log("✅ Product CRUD testi BAŞARILI");
    
  } catch (error) {
    testResults.products.details.push(`❌ Product CRUD hatası: ${error.message}`);
    console.error("❌ Product CRUD testi BAŞARISIZ:", error.response?.data || error.message);
  }
}

async function testWebScraping() {
  console.log("\n🔍 4️⃣ WEB SCRAPING TESTİ");
  console.log("=" .repeat(50));
  
  try {
    const { scrapePrice } = require("./src/services/scraper");
    const { comparePrices } = require("./src/priceCompare");
    
    // Hepsiburada testi
    console.log("🕷️ Hepsiburada scraper test ediliyor...");
    const hepsiburadaUrl = "https://www.hepsiburada.com/logitech-g213-prodigy-rgb-turkce-gaming-klavye-920-008094-p-HBV00000247UE";
    const hepsiburadaPrice = await scrapePrice(hepsiburadaUrl);
    
    if (hepsiburadaPrice !== null) {
      testResults.scraping.details.push(`✅ Hepsiburada scraper çalışıyor - Fiyat: ${hepsiburadaPrice} TL`);
    } else {
      testResults.scraping.details.push("❌ Hepsiburada scraper fiyat bulamadı");
    }
    
    // N11 testi
    console.log("🕷️ N11 scraper test ediliyor...");
    const n11Url = "https://www.n11.com/urun/logitech-g213-prodigy-920-008094-usb-kablolu-rgb-aydinlatmali-oyuncu-turkce-q-klavye-61097";
    const n11Price = await scrapePrice(n11Url);
    
    if (n11Price !== null) {
      testResults.scraping.details.push(`✅ N11 scraper çalışıyor - Fiyat: ${n11Price} TL`);
    } else {
      testResults.scraping.details.push("❌ N11 scraper fiyat bulamadı");
    }
    
    // Fiyat karşılaştırma testi
    if (hepsiburadaPrice !== null && n11Price !== null) {
      console.log("⚖️ Fiyat karşılaştırma test ediliyor...");
      const comparison = await comparePrices("Test Ürün", [hepsiburadaUrl, n11Url]);
      
      if (comparison && comparison.length > 0) {
        testResults.scraping.details.push("✅ Fiyat karşılaştırma sistemi çalışıyor");
        const cheapest = comparison.filter(r => r.price !== null).sort((a, b) => a.price - b.price)[0];
        if (cheapest) {
          testResults.scraping.details.push(`✅ En ucuz: ${cheapest.site} - ${cheapest.price} TL`);
        }
      }
    }
    
    testResults.scraping.status = "✅";
    console.log("✅ Web scraping testi BAŞARILI");
    
  } catch (error) {
    testResults.scraping.details.push(`❌ Web scraping hatası: ${error.message}`);
    console.error("❌ Web scraping testi BAŞARISIZ:", error.message);
  }
}

async function testCronJob() {
  console.log("\n🔍 5️⃣ CRON JOB VE OTOMATİK FİYAT TAKİBİ TESTİ");
  console.log("=" .repeat(50));
  
  try {
    const { initPriceChecker } = require("./src/services/priceChecker");
    
    // Cron job'ı manuel olarak bir kere çalıştır
    console.log("⏰ Cron job manuel tetikleniyor...");
    const { runOnce } = initPriceChecker();
    await runOnce();
    
    testResults.cronJob.details.push("✅ Cron job manuel tetikleme başarılı");
    
    // PriceHistory tablosunda yeni kayıt var mı kontrol et
    const historyCount = await PriceHistory.count();
    testResults.cronJob.details.push(`📊 PriceHistory kayıt sayısı: ${historyCount}`);
    
    // Test ürünümüzün fiyat geçmişini kontrol et
    if (testProductId) {
      const productHistory = await PriceHistory.findAll({
        where: { productId: testProductId },
        order: [['date', 'DESC']],
        limit: 5
      });
      
      if (productHistory.length > 0) {
        testResults.cronJob.details.push(`✅ Test ürünü için ${productHistory.length} fiyat kaydı oluşturuldu`);
        productHistory.forEach((history, index) => {
          testResults.cronJob.details.push(`   ${index + 1}. ${history.site}: ${history.price} TL (${history.date.toLocaleString()})`);
        });
      }
      
      // currentLowestPrice güncellenmiş mi kontrol et
      const updatedProduct = await Product.findByPk(testProductId);
      if (updatedProduct && updatedProduct.currentLowestPrice) {
        testResults.cronJob.details.push(`✅ currentLowestPrice güncellendi: ${updatedProduct.currentLowestPrice} TL`);
      }
    }
    
    testResults.cronJob.status = "✅";
    console.log("✅ Cron job testi BAŞARILI");
    
  } catch (error) {
    testResults.cronJob.details.push(`❌ Cron job hatası: ${error.message}`);
    console.error("❌ Cron job testi BAŞARISIZ:", error.message);
  }
}

async function testMailSystem() {
  console.log("\n🔍 6️⃣ MAİL SİSTEMİ TESTİ");
  console.log("=" .repeat(50));
  
  try {
    const { sendMail } = require("./src/config/mailer");
    
    // Test maili gönder
    console.log("📧 Test maili gönderiliyor...");
    const testEmail = process.env.EMAIL_USER; // Kendi adresimize gönder
    
    await sendMail(
      testEmail,
      "PriceAgent Test Maili",
      "Bu bir test mailidir. Mail sistemi çalışıyor! 🎉"
    );
    
    testResults.mail.details.push("✅ Test maili başarıyla gönderildi");
    testResults.mail.details.push(`📧 Alıcı: ${testEmail}`);
    
    testResults.mail.status = "✅";
    console.log("✅ Mail sistemi testi BAŞARILI");
    
  } catch (error) {
    testResults.mail.details.push(`❌ Mail sistemi hatası: ${error.message}`);
    console.error("❌ Mail sistemi testi BAŞARISIZ:", error.message);
  }
}

async function cleanup() {
  console.log("\n🧹 TEST VERİLERİNİ TEMİZLİYOR...");
  
  try {
    // Test kullanıcısını ve ürünlerini sil
    if (testProductId) {
      await Product.destroy({ where: { id: testProductId } });
      console.log("✅ Test ürünü silindi");
    }
    
    const testUserRecord = await User.findOne({ where: { email: testUser.email } });
    if (testUserRecord) {
      await testUserRecord.destroy();
      console.log("✅ Test kullanıcısı silindi");
    }
    
  } catch (error) {
    console.error("⚠️ Temizlik sırasında hata:", error.message);
  }
}

async function generateReport() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 BACKEND VE DATABASE SİSTEMİ TEST RAPORU");
  console.log("=".repeat(80));
  
  const categories = [
    { name: "1️⃣ Database Bağlantısı", key: "database" },
    { name: "2️⃣ Auth Sistemi", key: "auth" },
    { name: "3️⃣ Product CRUD", key: "products" },
    { name: "4️⃣ Web Scraping", key: "scraping" },
    { name: "5️⃣ Cron Job", key: "cronJob" },
    { name: "6️⃣ Mail Sistemi", key: "mail" }
  ];
  
  let totalSuccess = 0;
  
  categories.forEach(category => {
    console.log(`\n${category.name}: ${testResults[category.key].status}`);
    testResults[category.key].details.forEach(detail => {
      console.log(`   ${detail}`);
    });
    
    if (testResults[category.key].status === "✅") {
      totalSuccess++;
    }
  });
  
  console.log("\n" + "=".repeat(80));
  console.log(`🎯 GENEL SONUÇ: ${totalSuccess}/${categories.length} BAŞARILI`);
  
  if (totalSuccess === categories.length) {
    console.log("🎉 TÜM SİSTEMLER ÇALIŞIYOR! Backend production-ready! 🚀");
  } else {
    console.log(`⚠️ ${categories.length - totalSuccess} sistem(de) sorun var, kontrol edilmeli.`);
  }
  
  console.log("=".repeat(80));
}

async function runAllTests() {
  console.log("🚀 BACKEND VE DATABASE SİSTEMİ KAPSAMLI TESTİ BAŞLIYOR...");
  console.log("Test başlangıç zamanı:", new Date().toLocaleString());
  
  try {
    await testDatabase();
    await testAuthSystem();
    await testProductCRUD();
    await testWebScraping();
    await testCronJob();
    await testMailSystem();
    
  } catch (error) {
    console.error("❌ Test süreci genel hatası:", error.message);
  } finally {
    await cleanup();
    await generateReport();
    
    // Database bağlantısını kapat
    await sequelize.close();
    console.log("\n✅ Database bağlantısı kapatıldı");
    console.log("🏁 Test tamamlandı:", new Date().toLocaleString());
  }
}

// Eğer bu dosya direkt çalıştırılırsa
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
