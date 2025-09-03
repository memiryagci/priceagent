"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PriceHistory = sequelize.define(
    "PriceHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      site: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "PriceHistories",
      timestamps: true,
    }
  );

  return PriceHistory;
};


