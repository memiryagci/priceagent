"use strict";

const { Product, PriceHistory } = require("../models");
const { fetchCurrentPrice } = require("../services/priceChecker");

exports.addProduct = async (req, res) => {
  try {
    const { name, targetPrice, url } = req.body;
    if (!name || !targetPrice || !url) {
      return res.status(400).json({ message: "name, targetPrice ve url gereklidir" });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Yetkisiz" });
    }

    console.log("addProduct user:", req.user);

    // 1) Ürünü kaydet
    const product = await Product.create({
      userId: req.user.id,
      name,
      targetPrice,
      url,
    });

    // 2) Güncel fiyatı çek (DB'ye kaydetmeden sadece response'ta döneceğiz)
    const currentPrice = await fetchCurrentPrice(url);

    // 3) Response'u currentPrice ile birlikte döndür
    return res.status(201).json({
      id: product.id,
      userId: product.userId,
      name: product.name,
      url: product.url,
      targetPrice: product.targetPrice,
      currentPrice,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (err) {
    console.error(err);
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


