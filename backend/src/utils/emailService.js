import nodemailer from "nodemailer";
import logger from "../config/logger.js";

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    // Production: Use service provider (Gmail, SendGrid, etc.)
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development: Use environment variables or fallback
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "localhost",
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth:
        process.env.EMAIL_USER && process.env.EMAIL_PASS
          ? {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            }
          : undefined,
    });
  }
};

let transporter = createTransporter();

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    logger.warn("Email transporter verification failed:", error.message);
  } else if (success) {
    logger.info("Email transporter verified successfully");
  }
});

/**
 * Send Email Function
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.html - HTML content
 * @param {String} options.text - Plain text content (optional)
 */
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER ||
        "noreply@skillflare.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to} - Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error.message);
    throw error;
  }
};

export default { sendEmail };
