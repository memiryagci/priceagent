"use strict";

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { addProduct, listProducts, updateProduct, deleteProduct, getProductHistory, scrapePrice, getDashboardStats } = require("../controllers/product.controller");

router.post("/add", auth, addProduct);
router.get("/list", auth, listProducts);
router.get("/dashboard-stats", auth, getDashboardStats);
router.put("/update/:id", auth, updateProduct);
router.delete("/delete/:id", auth, deleteProduct);
router.get("/:id/history", auth, getProductHistory);
router.post("/scrape-price", auth, scrapePrice);

module.exports = router;


