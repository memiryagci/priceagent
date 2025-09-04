"use strict";

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth");

// Tüm admin route'ları auth ve admin kontrolü gerektirir
router.use(authMiddleware);
router.use(adminController.checkAdmin);

// Kullanıcı yönetimi
router.get("/users", adminController.getUsers);
router.get("/users/:userId", adminController.getUserDetail);
router.delete("/users/:userId", adminController.deleteUser);
router.put("/users/:userId", adminController.updateUser);

module.exports = router;
