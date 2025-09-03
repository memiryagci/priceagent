"use strict";

const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Yetkisiz" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.user = { id: payload.sub, email: payload.email };
    console.log("auth payload:", payload);
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Geçersiz token" });
  }
};


