import database from "infra/database";

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

export default Object.freeze({
  createEmailVerification,
});