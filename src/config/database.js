"use strict";

require("dotenv").config();
const { Sequelize } = require("sequelize");

function parseBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  const normalized = String(value).toLowerCase().trim();
  return ["1", "true", "yes", "on"].includes(normalized);
}

const requiredVars = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASS"];
const missing = requiredVars.filter((k) => !process.env[k] || String(process.env[k]).trim() === "");
if (missing.length) {
  console.warn(
    `Missing required DB env vars: ${missing.join(", ")} — check your .env. ` +
      `Connection will likely fail with 'config.server' or similar.`
  );
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 1433),
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: parseBool(process.env.DB_ENCRYPT ?? true, true),
        trustServerCertificate: parseBool(process.env.DB_TRUST_CERT, false),
        instanceName: process.env.DB_INSTANCE || undefined,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: console.log,
  }
);

// Bağlantı doğrulaması server başlatılırken yapılacak (src/server.js)

module.exports = { sequelize };
