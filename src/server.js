"use strict";

require("dotenv").config();
const http = require("http");
const app = require("./app");
const { sequelize } = require("./config/database");
const { initPriceChecker } = require("./services/priceChecker");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    await sequelize.sync({ force: false });
    console.log("Database & tables created!");
  } catch (error) {
    console.error("Database sync failed:", error);
  }

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Cron job başlat
    const { task } = initPriceChecker();
    task.start();
    console.log("Price checker cron started (*/10 * * * *)");
  });
}

startServer();


