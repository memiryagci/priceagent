"use strict";

const { sequelize } = require("../config/database");
const defineUser = require("./User");
const defineProduct = require("./Product");
const definePriceHistory = require("./PriceHistory");

const db = {};

db.sequelize = sequelize;
db.User = defineUser(sequelize);
db.Product = defineProduct(sequelize);
db.PriceHistory = definePriceHistory(sequelize);

// Relations
db.User.hasMany(db.Product, { foreignKey: "userId", as: "products" });
db.Product.belongsTo(db.User, { foreignKey: "userId", as: "user" });
db.Product.hasMany(db.PriceHistory, { foreignKey: "productId", as: "priceHistories" });
db.PriceHistory.belongsTo(db.Product, { foreignKey: "productId", as: "product" });

module.exports = db;


