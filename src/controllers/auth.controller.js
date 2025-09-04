"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email ve password gereklidir" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "Bu email zaten kayıtlı" });
    }

    const passwordHashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: passwordHashed, name });
    
    // JWT token oluştur
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    return res.status(201).json({ 
      message: "Kayıt başarılı",
      user: { id: user.id, email: user.email, name: user.name },
      token 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kayıt sırasında hata oluştu" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email ve password gereklidir" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Geçersiz kimlik bilgileri" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Geçersiz kimlik bilgileri" });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ 
      message: "Giriş başarılı",
      user: { id: user.id, email: user.email, name: user.name },
      token 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Giriş sırasında hata oluştu" });
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "E-posta adresi gereklidir" });
    }

    // E-posta format kontrolü
    const emailRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Geçerli bir e-posta adresi girin" });
    }

    // Mevcut kullanıcıyı bul
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Aynı e-posta kontrolü
    if (user.email === email) {
      return res.status(400).json({ message: "Yeni e-posta mevcut e-posta ile aynı" });
    }

    // E-posta zaten kullanımda mı kontrol et
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Bu e-posta adresi zaten kullanımda" });
    }

    // E-posta adresini güncelle
    await user.update({ email });

    return res.status(200).json({ 
      message: "E-posta başarıyla değiştirildi",
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "E-posta değiştirme sırasında hata oluştu" });
  }
};


