import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/env.js"; 

export const sendEmail = async (options) => {
  
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS, 
    },
  });

  const mailOptions = {
    from: `"Identity Verification Team" <${EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Identity Verification Update</h2>
        <p>Hello,</p>
        <p>${options.message}</p>
        <br />
        <p style="font-size: 0.8em; color: #777;">This is an automated message, please do not reply directly to this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};