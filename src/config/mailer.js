"use strict";

require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

async function sendMail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER || "noreply@example.com",
      to,
      subject,
      text,
    });
    console.log(`[mail] gönderildi: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[mail] hata: ${err.message}`);
    throw err;
  }
}

module.exports = { transporter, sendMail };


