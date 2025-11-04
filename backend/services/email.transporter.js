import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465; 
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
});

export default transporter;
