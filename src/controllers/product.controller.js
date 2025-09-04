"use strict";

const { Product, PriceHistory } = require("../models");
const { fetchCurrentPrice } = require("../services/priceChecker");
const { scrapePrice } = require("../services/scraper");

exports.addProduct = async (req, res) => {
  try {
    const { name, targetPrice, urls, prices } = req.body;
    if (!name || !targetPrice || !urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ message: "name, targetPrice ve en az bir url gereklidir" });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Yetkisiz" });
    }

    console.log("addProduct user:", req.user);
    console.log("addProduct data:", { name, targetPrice, urls: urls.length, prices: prices?.length });

    // Ana ürünü kaydet (ilk URL ile)
    const product = await Product.create({
      userId: req.user.id,
      name,
      targetPrice,
      url: urls[0], // İlk URL'yi ana URL olarak kaydet
    });

    // Eğer fiyat bilgileri gelmiş ise PriceHistory'e kaydet
    if (prices && Array.isArray(prices)) {
      for (const priceData of prices) {
        if (priceData.price && priceData.site) {
          await PriceHistory.create({
            productId: product.id,
            site: priceData.site,
            price: priceData.price,
            date: new Date(),
          });
        }
      }

      // En düşük fiyatı hesapla ve ürüne kaydet
      const validPrices = prices.filter(p => p.price !== null).map(p => p.price);
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        product.currentLowestPrice = minPrice;
        await product.save();
      }
    }

    return res.status(201).json({
      id: product.id,
      userId: product.userId,
      name: product.name,
      url: product.url,
      targetPrice: product.targetPrice,
      currentLowestPrice: product.currentLowestPrice,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      message: "Ürün başarıyla kaydedildi ve fiyat takibine alındı!"
    });
  } catch (err) {
    console.error("addProduct error:", err);
    return res.status(500).json({ message: "Ürün eklenirken hata oluştu" });
  }
};

exports.listProducts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Yetkisiz" });
    }
    console.log("listProducts user:", req.user);

    // En düşük fiyat ve site bilgisi ile listeleme
    const products = await Product.findAll({ where: { userId: req.user.id } });

    const enriched = [];
    for (const p of products) {
      const [rows] = await Product.sequelize.query(
        "SELECT TOP 1 site, price FROM PriceHistories WHERE productId = :pid ORDER BY price ASC",
        { replacements: { pid: p.id } }
      );
      const lowest = rows && rows[0] ? rows[0] : null;
      enriched.push({
        id: p.id,
        userId: p.userId,
        name: p.name,
        url: p.url,
        targetPrice: p.targetPrice,
        currentLowestPrice: p.currentLowestPrice,
        lowestSite: lowest ? lowest.site : null,
        lowestPrice: lowest ? lowest.price : null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      });
    }

    console.log("listProducts found:", enriched.length);
    return res.status(200).json(enriched);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Ürünler listelenirken hata oluştu" });
  }
};

exports.getProductHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Yetkisiz" });
    }
    const { id } = req.params;
    const product = await Product.findOne({ where: { id, userId: req.user.id } });
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    // Gün bazlı en düşük fiyat
    const [rows] = await Product.sequelize.query(
      "SELECT CAST(date AS DATE) AS day, MIN(price) AS minPrice FROM PriceHistories WHERE productId = :pid GROUP BY CAST(date AS DATE) ORDER BY day ASC",
      { replacements: { pid: product.id } }
    );

    return res.status(200).json({ productId: product.id, history: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Geçmiş getirilirken hata oluştu" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Yetkisiz" });
    }
    const { id } = req.params;
    const { name, targetPrice, url } = req.body;
    const product = await Product.findOne({ where: { id, userId: req.user.id } });
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    if (name !== undefined) product.name = name;
    if (targetPrice !== undefined) product.targetPrice = targetPrice;
    if (url !== undefined) product.url = url;
    await product.save();

    return res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Ürün güncellenirken hata oluştu" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Yetkisiz" });
    }
    const { id } = req.params;
    const deleted = await Product.destroy({ where: { id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: "Ürün bulunamadı" });
    return res.status(200).json({ message: "Silindi" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Ürün silinirken hata oluştu" });
  }
};

// Fiyat çekme endpoint'i - Frontend için
exports.scrapePrice = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Yetkisiz" });
    }

    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ 
        message: "Geçerli bir URL gereklidir",
        error: "INVALID_URL"
      });
    }

    // URL validasyonu
    const isHepsiburada = url.includes("hepsiburada.com");
    const isN11 = url.includes("n11.com");
    
    if (!isHepsiburada && !isN11) {
      return res.status(400).json({ 
        message: "Desteklenmeyen site. Sadece Hepsiburada ve N11 destekleniyor.",
        error: "UNSUPPORTED_SITE",
        supportedSites: ["hepsiburada.com", "n11.com"]
      });
    }

    // URL formatı kontrolü
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        message: "Geçersiz URL formatı",
        error: "INVALID_URL_FORMAT"
      });
    }

    console.log(`[scrapePrice] ${req.user.email} için fiyat çekiliyor: ${url}`);
    
    // Fiyat çekme işlemi
    const price = await scrapePrice(url);
    
    if (price === null || price === undefined) {
      return res.status(404).json({ 
        message: "Bu sayfadan fiyat çekilemedi. Lütfen ürün sayfası linkini kontrol edin.",
        error: "PRICE_NOT_FOUND",
        url: url
      });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(422).json({ 
        message: "Çekilen fiyat geçersiz",
        error: "INVALID_PRICE",
        price: price
      });
    }

    console.log(`[scrapePrice] Başarılı: ${price} TL - ${url}`);
    
    return res.status(200).json({
      success: true,
      price: price,
      url: url,
      site: isHepsiburada ? 'hepsiburada' : 'n11',
      scrapedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error('[scrapePrice] Hata:', err);
    
    // Timeout hatası
    if (err.message && err.message.includes('timeout')) {
      return res.status(408).json({ 
        message: "Sayfa yükleme zaman aşımı. Lütfen tekrar deneyin.",
        error: "TIMEOUT"
      });
    }
    
    // Network hatası
    if (err.message && (err.message.includes('net::') || err.message.includes('ENOTFOUND'))) {
      return res.status(503).json({ 
        message: "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
        error: "NETWORK_ERROR"
      });
    }
    
    return res.status(500).json({ 
      message: "Fiyat çekilirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
      error: "SCRAPER_ERROR"
    });
  }
};

// Dashboard istatistikleri - Kullanıcıya özel
exports.getDashboardStats = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Yetkisiz" });
    }

    const userId = req.user.id;
    console.log("getDashboardStats user:", req.user);

    // Kullanıcının toplam ürün sayısı
    const totalProducts = await Product.count({ where: { userId } });

    // Hedef fiyata ulaşan ürün sayısı
    const [targetReachedRows] = await Product.sequelize.query(
      `SELECT COUNT(*) as count FROM Products p 
       WHERE p.userId = :userId AND p.currentLowestPrice <= p.targetPrice`,
      { replacements: { userId } }
    );
    const targetReachedCount = targetReachedRows[0]?.count || 0;

    // Toplam tasarruf (hedef fiyat - mevcut en düşük fiyat)
    const [savingsRows] = await Product.sequelize.query(
      `SELECT SUM(CASE WHEN p.currentLowestPrice < p.targetPrice 
                      THEN p.targetPrice - p.currentLowestPrice 
                      ELSE 0 END) as totalSavings
       FROM Products p WHERE p.userId = :userId`,
      { replacements: { userId } }
    );
    const totalSavings = savingsRows[0]?.totalSavings || 0;

    // Son 7 gündeki fiyat kontrol sayısı
    const [priceChecksRows] = await Product.sequelize.query(
      `SELECT COUNT(*) as count FROM PriceHistories ph
       INNER JOIN Products p ON ph.productId = p.id
       WHERE p.userId = :userId AND ph.date >= DATEADD(day, -7, GETDATE())`,
      { replacements: { userId } }
    );
    const weeklyPriceChecks = priceChecksRows[0]?.count || 0;

    return res.status(200).json({
      totalProducts,
      targetReachedCount,
      totalSavings: Math.round(totalSavings * 100) / 100, // 2 decimal places
      weeklyPriceChecks
    });

  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({ message: "İstatistikler getirilirken hata oluştu" });
  }
};


