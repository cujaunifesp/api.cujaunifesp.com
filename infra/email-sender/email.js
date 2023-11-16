import nodemailer from "nodemailer";

import emailTemplates from "infra/email-sender/email-templates";

const transporterConfiguration = {
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

if (!process.env.NEXT_PUBLIC_VERCEL_ENV) {
  transporterConfiguration.secure = false;
}

const transporter = nodemailer.createTransport(transporterConfiguration);

async function sendText({ to, subject, text }) {
  const mailOptions = {
    from: "no-reply@cujaunifesp.com",
    to: to,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
}

async function sendWithTemplate({ to, subject, templateName, replacements }) {
  let html = emailTemplates.emailVerification();

  for (const key in replacements) {
    html = html.replace(key, replacements[key]);
  }

  const mailOptions = {
    from: "no-reply@cujaunifesp.com",
    to: to,
    subject: subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

export default Object.freeze({
  sendText,
  sendWithTemplate,
});
