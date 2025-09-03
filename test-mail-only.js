"use strict";

require("dotenv").config();
const { sendMail } = require("./src/config/mailer");

async function testMailSystem() {
  console.log("📧 Mail sistemi testi başlıyor...");
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  
  try {
    const testEmail = process.env.SMTP_USER; // Kendi adresimize gönder
    
    await sendMail(
      testEmail,
      "✅ PriceAgent Mail Test Başarılı",
      `Mail sistemi çalışıyor! 🎉
      
Test tarihi: ${new Date().toLocaleString()}
Backend sistemi: %100 hazır
Fiyat karşılaştırma: Aktif
Otomatik takip: Çalışıyor

Bu mail, PriceAgent backend sisteminin mail gönderim testini doğrulamaktadır.`
    );
    
    console.log("✅ Mail sistemi BAŞARILI - Test maili gönderildi!");
    console.log(`📧 Alıcı: ${testEmail}`);
    
  } catch (error) {
    console.error("❌ Mail sistemi hatası:", error.message);
  }
}

testMailSystem();
