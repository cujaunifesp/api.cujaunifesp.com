import database from "infra/database";

export async function create({ email, verification_code }) {
  const results = await database.query({
    text: `
      INSERT INTO email_verifications (email, verification_code, expires_at)
      VALUES ($1, $2, now() + interval '15 minutes')
      RETURNING
        *
    ;`,
    values: [email, verification_code],
  });

  return results.rows[0];
}

export default Object.freeze({
  create,
});
