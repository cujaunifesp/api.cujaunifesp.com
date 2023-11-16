import email from "infra/email-sender/email";
import emailVerification from "src/models/email-verification";

async function startEmailVerification(email) {
  const verification_code = generateRandomCode(6);

  const createdEmailVerification = await emailVerification.create({
    email,
    verification_code,
  });

  await sendVerificationEmail({
    to: createdEmailVerification.email,
    code: createdEmailVerification.verification_code,
  });
}

function generateRandomCode(length) {
  let code = "";
  let allowedCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

  for (let i = 0; i < length; i++) {
    code += allowedCharacters.charAt(
      Math.floor(Math.random() * allowedCharacters.length),
    );
  }

  return code;
}

async function sendVerificationEmail({ to, code }) {
  await email.sendWithTemplate({
    to,
    subject: "Seu código de verificação",
    templateName: "emailVerfication",
    replacements: {
      "{VERIFICATION_CODE}": code,
    },
  });
}

export default Object.freeze({
  startEmailVerification,
});
