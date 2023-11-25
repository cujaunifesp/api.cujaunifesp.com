import jwt from "jsonwebtoken";

import emailVerificationService from "src/services/auth/email-verification";

async function createTokenByEmailVerification({ email, verificationCode }) {
  await emailVerificationService.verify({ email, verificationCode });
  const token = generateToken({
    email,
    method: "email_verification",
  });
  const decoded = decodeToken(token);
  return {
    token,
    method: "email_verification",
    expires_at: new Date(decoded.exp * 1000).toISOString(),
    created_at: new Date(decoded.iat * 1000).toISOString(),
  };
}

function generateToken(payloadObject, options = {}) {
  return jwt.sign(payloadObject, process.env.JWT_SIGNER_KEY, {
    expiresIn: options.expiresIn || 604800, //7 dias
  });
}

function decodeToken(token) {
  return jwt.decode(token);
}

function getGeneratedTokenValidity(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SIGNER_KEY);

    return {
      valid: true,
      token,
      method: decoded.method,
      expires_at: new Date(decoded.exp * 1000).toISOString(),
      created_at: new Date(decoded.iat * 1000).toISOString(),
    };
  } catch (error) {
    const decoded = decodeToken(token);

    if (decoded) {
      return {
        valid: false,
        token,
        method: decoded?.method,
        expires_at: new Date(decoded?.exp * 1000).toISOString(),
        created_at: new Date(decoded?.iat * 1000).toISOString(),
      };
    } else {
      return {
        token,
        valid: false,
      };
    }
  }
}

export default Object.freeze({
  createTokenByEmailVerification,
  generateToken,
  getGeneratedTokenValidity,
});
