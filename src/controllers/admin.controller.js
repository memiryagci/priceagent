"use strict";

const { User, Product, PriceHistory } = require("../models");
const { Op } = require("sequelize");

// Admin kontrolü middleware
const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Kimlik doğrulama gereklidir" });
  }
  
  const userEmail = req.user.email;
  if (userEmail !== 'admin@admin.com') {
    return res.status(403).json({ message: "Bu işlem için admin yetkisi gereklidir" });
  }
  next();
};

// Tüm kullanıcıları listele
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      users: users
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kullanıcılar listelenirken hata oluştu" });
  }
};

// Kullanıcı detaylarını getir
exports.getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcının ürün sayısını al
    const productCount = await Product.count({
      where: { userId: user.id }
    });

    return res.status(200).json({
      success: true,
      user: {
        ...user.toJSON(),
        productCount
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kullanıcı detayları alınırken hata oluştu" });
  }
};

// Kullanıcıyı sil (tüm verileriyle birlikte)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Admin kendini silemez
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: "Kendi hesabınızı silemezsiniz" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcının ürünlerini bul
    const userProducts = await Product.findAll({
      where: { userId: user.id }
    });

    // Her ürün için fiyat geçmişini sil
    for (const product of userProducts) {
      await PriceHistory.destroy({
        where: { productId: product.id }
      });
    }

    // Kullanıcının ürünlerini sil
    await Product.destroy({
      where: { userId: user.id }
    });

    // Kullanıcıyı sil
    await user.destroy();

    return res.status(200).json({
      success: true,
      message: "Kullanıcı ve tüm verileri başarıyla silindi"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kullanıcı silinirken hata oluştu" });
  }
};

// Kullanıcı bilgilerini güncelle
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // E-posta benzersizlik kontrolü (kendisi hariç)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email: email,
          id: { [Op.ne]: userId }
        }
      });

      if (existingUser) {
        return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda" });
      }
    }

    // Kullanıcı bilgilerini güncelle
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    await user.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Kullanıcı bilgileri başarıyla güncellendi",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kullanıcı güncellenirken hata oluştu" });
  }
};

exports.checkAdmin = checkAdmin;
