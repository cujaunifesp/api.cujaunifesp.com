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
    from: {
      name: "CUJA Digital",
      address: "no-reply@cujaunifesp.com",
    },
    to: to,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
}

async function sendWithTemplate({ to, subject, template, replacements }) {
  let html = template;

  for (const key in replacements) {
    html = html.replace(key, replacements[key]);
  }

  const mailOptions = {
    from: {
      name: "CUJA Digital",
      address: "no-reply@cujaunifesp.com",
    },
    to: to,
    subject: subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

export default Object.freeze({
  sendText,
  sendWithTemplate,
  templates: emailTemplates,
});
