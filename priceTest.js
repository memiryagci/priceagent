require("dotenv").config();
const { initPriceChecker } = require("./src/services/priceChecker");  // BURASI EKSİKTİ

function testRun() {
  const { runOnce } = initPriceChecker();
  runOnce();
}

testRun();

//'./src/services/priceChecker'