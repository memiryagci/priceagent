"use strict";

const { scrapeHepsiburada } = require("./hepsiburadaScraper");
const { scrapeN11 } = require("./n11Scraper");

async function scrapePrice(url) {
  if (!url || typeof url !== "string") return null;

  // Site tipini belirle
  const isHepsiburada = url.includes("hepsiburada.com");
  const isN11 = url.includes("n11.com");
  
  if (!isHepsiburada && !isN11) {
    console.log("❌ Desteklenmeyen site");
    return null;
  }

  try {
    if (isHepsiburada) {
      return await scrapeHepsiburada(url);
    } else if (isN11) {
      return await scrapeN11(url);
    }
  } catch (err) {
    console.error("❌ Scraper hatası:", err.message);
    return null;
  }
}

module.exports = { scrapePrice };