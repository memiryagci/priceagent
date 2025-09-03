"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      targetPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      currentLowestPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      tableName: "Products",
      timestamps: true,
    }
  );

  return Product;
};


