import nodemailer from "nodemailer";

const senderEmail = process.env.SENDER_EMAIL;
const senderPass = process.env.SENDER_PASS;

if (!senderEmail || !senderPass) {
  throw new Error(
    "Missing SMTP credentials. Set SENDER_EMAIL and SENDER_PASS in your .env file.",
  );
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: senderEmail,
    pass: senderPass,
  },
});

export default transporter;
