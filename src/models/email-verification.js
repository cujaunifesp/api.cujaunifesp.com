import database from "infra/database";

async function create({ email, verification_code }) {
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

async function findLastByEmail(email) {
  const results = await database.query({
    text: `
      SELECT 
        *, now() > expires_at AS expired
      FROM 
        email_verifications
      WHERE 
        email = $1
      ORDER BY 
        created_at DESC
      LIMIT 1;
    `,
    values: [email],
  });

  return results.rows[0];
}

async function updateAttemptsAndUse(id, { attempts, used }) {
  const results = await database.query({
    text: `
      UPDATE 
        email_verifications
      SET
        attempts = $1,
        used = $2
      WHERE 
        id = $3;
    `,
    values: [attempts, used, id],
  });

  return results.rows[0];
}

export default Object.freeze({
  create,
  findLastByEmail,
  updateAttemptsAndUse,
});
