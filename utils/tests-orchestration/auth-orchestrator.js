import database from "infra/database";
import tokenGeneratorService from "src/services/auth/token-generator";

async function createEmailVerification({ email, verification_code, expired }) {
  const results = await database.query({
    text: `
      INSERT INTO email_verifications (email, verification_code, expires_at)
      VALUES ($1, $2, ${expired ? "now()" : "now() + interval '15 minutes'"})
      RETURNING
        *
    ;`,
    values: [email, verification_code || "ABCDEF"],
  });

  return results.rows[0];
}

function createUserToken(payloadObject) {
  return tokenGeneratorService.generateToken(payloadObject);
}

export default Object.freeze({
  createEmailVerification,
  createUserToken,
});
