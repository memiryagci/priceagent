"use strict";

const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Yetkisiz" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    
    // Kullanıcı bilgilerini database'den çek
    const user = await User.findByPk(payload.sub, {
      attributes: ['id', 'email', 'name']
    });
    
    if (!user) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı" });
    }
    
    req.user = { id: user.id, email: user.email, name: user.name };
    console.log("auth payload:", payload);
    return next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Geçersiz token" });
  }
};


