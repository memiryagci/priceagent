"use strict";

const express = require("express");
const { testPriceChecker } = require("../services/testPriceChecker");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Test başlat
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { testUrl } = req.body;
    const userEmail = req.user.email;

    if (!testUrl) {
      return res.status(400).json({ 
        success: false, 
        message: "testUrl gerekli" 
      });
    }

    if (!userEmail) {
      return res.status(400).json({ 
        success: false, 
        message: "Kullanıcı email'i bulunamadı" 
      });
    }

    const started = testPriceChecker.start(testUrl, userEmail);
    
    if (!started) {
      return res.status(400).json({ 
        success: false, 
        message: "Test zaten çalışıyor" 
      });
    }

    res.json({ 
      success: true, 
      message: "Test başlatıldı",
      status: testPriceChecker.getStatus()
    });

  } catch (error) {
    console.error("Test başlatma hatası:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Test durdur
router.post("/stop", authMiddleware, async (req, res) => {
  try {
    const stopped = testPriceChecker.stop();
    
    if (!stopped) {
      return res.status(400).json({ 
        success: false, 
        message: "Test zaten durmuş" 
      });
    }

    res.json({ 
      success: true, 
      message: "Test durduruldu",
      status: testPriceChecker.getStatus()
    });

  } catch (error) {
    console.error("Test durdurma hatası:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Test durumu
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const status = testPriceChecker.getStatus();
    res.json({ 
      success: true, 
      status: status 
    });

  } catch (error) {
    console.error("Test durumu alma hatası:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Test logları
router.get("/logs", authMiddleware, async (req, res) => {
  try {
    const logs = testPriceChecker.getLogs();
    res.json({ 
      success: true, 
      logs: logs 
    });

  } catch (error) {
    console.error("Test log alma hatası:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
