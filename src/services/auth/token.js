import jwt from "jsonwebtoken";

import emailVerificationService from "src/services/auth/email-verification";

async function createTokenByEmailVerification({ email, verificationCode }) {
  await emailVerificationService.verify({ email, verificationCode });
  const token = generateToken({
    email,
    method: "email_verification",
    role: "visitor",
  });
  const decoded = decodeToken(token);
  return {
    token,
    method: "email_verification",
    expires_at: new Date(decoded.exp * 1000).toISOString(),
    created_at: new Date(decoded.iat * 1000).toISOString(),
  };
}

function generateToken(payloadObject) {
  return jwt.sign(payloadObject, process.env.JWT_SIGNER_KEY, {
    expiresIn: 604800, //7 dias
  });
}

function decodeToken(token) {
  return jwt.decode(token);
}

export default Object.freeze({
  createTokenByEmailVerification,
});
