"use strict";

const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.put("/change-email", authMiddleware, auth.changeEmail);

module.exports = router;


