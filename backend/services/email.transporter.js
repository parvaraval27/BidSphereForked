import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "bidsphere.auction@gmail.com",
        pass: "pvsa gnpn roxg fivf"
    }
});

export default transporter;