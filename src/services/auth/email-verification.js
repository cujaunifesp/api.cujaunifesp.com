import email from "infra/email-sender/email";
import emailVerification from "src/models/email-verification";
import {
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "utils/errors";

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

  return createdEmailVerification;
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

async function verify({ email, verificationCode }) {
  const lastEmailVerification =
    await emailVerification.findLastVerificationByEmail(email);

  if (!lastEmailVerification) {
    throw new NotFoundError({
      message:
        "Não encontramos nenhum código de verificação para o email informado.",
      action: "Reenvie o email de confirmação para gerar um novo código.",
    });
  }

  if (lastEmailVerification.expired || lastEmailVerification.used) {
    throw new UnauthorizedError({
      message: "O código de verificação está expirado.",
      action: "Reenvie o email de confirmação para gerar um novo código.",
    });
  }

  if (lastEmailVerification.attempts >= 10) {
    throw new TooManyRequestsError({
      message:
        "Você excedeu o número de tentativas para o código de validação.",
      action: "Reenvie o email de confirmação para gerar um novo código.",
    });
  }

  const isCodeCorrect =
    lastEmailVerification.verification_code === verificationCode;

  if (!isCodeCorrect) {
    await emailVerification.update(lastEmailVerification.id, {
      attempts: lastEmailVerification.attempts + 1,
      used: lastEmailVerification.used,
    });

    throw new UnauthorizedError({
      message: "O código de verificação está incorreto.",
      action:
        "Tente novamente ou reenvie o email de confirmação para gerar um novo código.",
    });
  }

  await emailVerification.update(lastEmailVerification.id, {
    attempts: lastEmailVerification.attempts + 1,
    used: true,
  });

  return "verified";
}

export default Object.freeze({
  startEmailVerification,
  verify,
});
