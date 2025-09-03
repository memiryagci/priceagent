"use strict";

require("dotenv").config();
const { sequelize } = require("../src/config/database");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB ok");

    const [rowsBefore] = await sequelize.query(
      "SELECT id, name, userId FROM Products ORDER BY id"
    );
    console.log("Products BEFORE:", rowsBefore);

    const TARGET_USER_ID = 1;
    const [result] = await sequelize.query(
      `UPDATE Products SET userId = ${TARGET_USER_ID} WHERE userId <> ${TARGET_USER_ID}`
    );
    console.log("Update result:", result);

    const [rowsAfter] = await sequelize.query(
      "SELECT id, name, userId FROM Products ORDER BY id"
    );
    console.log("Products AFTER:", rowsAfter);
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
})();


