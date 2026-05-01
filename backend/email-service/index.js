import dotenv from "dotenv";

dotenv.config();
import nodemailer from "nodemailer"
// import { prompts } from "../ai-service/prompt.js";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendEmailsNodemailer = async ({subject, bdy, messageId, listUnsubscribeHeader}, email) => {


    const mailOptions = {
    from: process.env.EMAIL_FROM_NAME || `${process.env.EMAIL_USER}`,
    to: email,
    subject: subject,
    text: bdy,
    headers: {
      'Message-ID': messageId || `<${Date.now()}@factoryjet.com>`,
      'List-Unsubscribe': listUnsubscribeHeader || '',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'X-Mailer': 'FactoryJet-Outreach/3.0',
      'Precedence': 'bulk'
    }
  };
  try {
    await transporter.sendMail(mailOptions);
    return {success: true}
  } catch (error) {
    console.log("error while sending email", error)
     return {success: false, error: error.message}
  }
}
