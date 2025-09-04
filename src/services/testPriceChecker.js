"use strict";

const cron = require("node-cron");
const { sendMail } = require("../config/mailer");
const { scrapePrice } = require("./scraper");

class TestPriceChecker {
  constructor() {
    this.testUrl = "";
    this.runCount = 0;
    this.mailCount = 0;
    this.logs = [];
    this.isRunning = false;
    this.priceCheckTask = null;
    this.mailTask = null;
    this.startTime = null;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.logs.push(logMessage);
    console.log(`[TEST-CRON] ${logMessage}`);
    
    // Son 50 log'u tut
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }
  }

  async checkPrice() {
    this.runCount++;
    this.log(`Cron çalışması #${this.runCount} başladı`);

    try {
      if (!this.testUrl) {
        throw new Error("Test URL'i belirtilmemiş");
      }

      this.log(`URL kontrol ediliyor: ${this.testUrl}`);
      
      // Gerçek scraping yap
      const price = await scrapePrice(this.testUrl);
      
      if (price !== null && price !== undefined) {
        this.log(`✅ Fiyat başarıyla çekildi: ${price} TL`);
      } else {
        this.log(`⚠️ Fiyat çekilemedi, null/undefined döndü`);
      }

    } catch (error) {
      this.log(`❌ Hata oluştu: ${error.message}`);
    }

    this.log(`Cron çalışması #${this.runCount} tamamlandı`);
  }

  async sendTestMail(userEmail) {
    this.mailCount++;
    const uptime = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    
    try {
      const subject = `Test Cron Raporu #${this.mailCount}`;
      const body = `
🔄 Test Cron Durumu

📊 İstatistikler:
• Cron ${this.runCount} kez çalıştı
• Mail ${this.mailCount} kez gönderildi  
• Çalışma süresi: ${uptime} saniye
• Test URL: ${this.testUrl}

📝 Son 10 Log:
${this.logs.slice(-10).join('\n')}

⏰ Rapor zamanı: ${new Date().toLocaleString('tr-TR')}
      `.trim();

      await sendMail(userEmail, subject, body);
      this.log(`📧 Test mail #${this.mailCount} gönderildi: ${userEmail}`);
      
    } catch (error) {
      this.log(`❌ Mail gönderme hatası: ${error.message}`);
    }
  }

  start(testUrl, userEmail) {
    if (this.isRunning) {
      this.log("⚠️ Test zaten çalışıyor!");
      return false;
    }

    this.testUrl = testUrl;
    this.runCount = 0;
    this.mailCount = 0;
    this.logs = [];
    this.startTime = Date.now();
    this.isRunning = true;

    this.log(`🚀 Test başlatıldı`);
    this.log(`URL: ${testUrl}`);
    this.log(`Email: ${userEmail}`);

    // Her 20 saniyede fiyat kontrolü
    this.priceCheckTask = cron.schedule("*/20 * * * * *", async () => {
      await this.checkPrice();
    });

    // Her 40 saniyede mail gönder
    this.mailTask = cron.schedule("*/40 * * * * *", async () => {
      await this.sendTestMail(userEmail);
    });

    this.log("✅ Cron görevleri başlatıldı (20s fiyat, 40s mail)");
    return true;
  }

  stop() {
    if (!this.isRunning) {
      this.log("⚠️ Test zaten durmuş!");
      return false;
    }

    if (this.priceCheckTask) {
      this.priceCheckTask.destroy();
      this.priceCheckTask = null;
    }

    if (this.mailTask) {
      this.mailTask.destroy();
      this.mailTask = null;
    }

    this.isRunning = false;
    const uptime = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    
    this.log(`🛑 Test durduruldu`);
    this.log(`Toplam çalışma süresi: ${uptime} saniye`);
    this.log(`Toplam cron çalışması: ${this.runCount}`);
    this.log(`Toplam mail gönderimi: ${this.mailCount}`);
    
    return true;
  }

  getStatus() {
    const uptime = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    
    return {
      isRunning: this.isRunning,
      testUrl: this.testUrl,
      runCount: this.runCount,
      mailCount: this.mailCount,
      uptime: uptime,
      logs: this.logs.slice(-20), // Son 20 log
      lastRun: this.logs.length > 0 ? this.logs[this.logs.length - 1] : null
    };
  }

  getLogs() {
    return this.logs;
  }
}

// Singleton instance
const testPriceChecker = new TestPriceChecker();

module.exports = { testPriceChecker };
