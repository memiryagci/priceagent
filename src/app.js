"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
const routes = require("./routes");
app.use("/api", routes);

// Product routes
const productRoutes = require("./routes/product.route");
app.use("/api/product", productRoutes);

module.exports = app;


