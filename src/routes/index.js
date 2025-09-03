"use strict";

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "API is up" });
});

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/auth", require("./auth.routes"));
router.use("/product", require("./product.route"));

module.exports = router;


