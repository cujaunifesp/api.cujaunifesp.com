import database from "infra/database";

async function createApplicationsWithSelectionGroups(applicationObject) {
  const pool = database.getNewPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: applicationsRows } = await client.query({
      text: `
      INSERT INTO 
        applications
          (
            name, 
            social_name,
            cpf,
            identity_document,
            email,
            phone, 
            address,
            zip_code,
            city,
            state,
            sabbatarian,
            special_assistance,
            special_assistance_justification,
            selection_id
          )
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING
          *
        ;
      `,
      values: [
        applicationObject.name,
        applicationObject.social_name,
        applicationObject.cpf,
        applicationObject.identity_document,
        applicationObject.email,
        applicationObject.phone,
        applicationObject.address,
        applicationObject.zip_code,
        applicationObject.city,
        applicationObject.state,
        applicationObject.sabbatarian,
        applicationObject.special_assistance,
        applicationObject.special_assistance_justification,
        applicationObject.selection_id,
      ],
    });

    for (
      let index = 0;
      index < applicationObject.selected_groups_ids.length;
      index++
    ) {
      const groupId = applicationObject.selected_groups_ids[index];
      await client.query({
        text: `
          INSERT INTO
            applications_in_groups (application_id, selection_group_id)
          VALUES
            ($1, $2);
        `,
        values: [applicationsRows[0].id, groupId],
      });
    }

    await client.query("COMMIT");
    return applicationsRows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function findByIdWithSelectionGroups(id) {
  const results = await database.query({
    text: `
    SELECT
        applications.*,
        COALESCE(
          JSONB_AGG(
              JSONB_BUILD_OBJECT(
                  'id', groups.id, 
                  'title', groups.title,
                  'code', groups.code
              ) 
              ORDER BY groups.code ASC
          ) FILTER (WHERE groups.id IS NOT NULL),
          '[]'::JSONB
      ) AS selection_application_groups
    FROM
        applications
    LEFT JOIN
        applications_in_groups per_groups ON applications.id = per_groups.application_id
    LEFT JOIN
        selections_applications_groups groups ON per_groups.selection_group_id = groups.id
    WHERE
        applications.id = $1
    GROUP BY
      applications.id
    LIMIT 1;
    `,
    values: [id],
  });

  const application = results.rows[0];

  return application;
}

async function findUserApplicationDuplicates({ cpf, selection_id }) {
  const results = await database.query({
    text: `
      SELECT count(applications.id) AS applications_count
      FROM applications
      WHERE applications.cpf = $1
        AND applications.selection_id = $2;
    `,
    values: [cpf, selection_id],
  });

  return results.rows[0];
}

async function findById(id) {
  const results = await database.query({
    text: `
      SELECT * FROM applications
      WHERE id = $1
      LIMIT 1;
    `,
    values: [id],
  });

  return results.rows[0];
}

async function findByEmail(email) {
  const results = await database.query({
    text: `
      SELECT * FROM applications
      WHERE email = $1;
    `,
    values: [email],
  });

  return results.rows;
}

export default Object.freeze({
  createApplicationsWithSelectionGroups,
  findByIdWithSelectionGroups,
  findUserApplicationDuplicates,
  findById,
  findByEmail,
});
