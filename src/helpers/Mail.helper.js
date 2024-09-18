const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "nk105000@gmail.com",
        pass: process.env.MAIL_PASSWORD,
    },
});

export const sendMail = async function ({ to, subject, text, html, amp }) {
    const info = await transporter.sendMail({
        from: '"E-commerce" <nk105000@gamil.com>',
        to: to,
        subject,
        text,
        html,
    });
    console.log("Message sent: %s", info.messageId);

    return info;
};
