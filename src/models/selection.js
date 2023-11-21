import database from "infra/database";

async function findLastPublishedWithSteps() {
  const results = await database.query({
    text: `
    SELECT
        selections.*,
        COALESCE(
          JSONB_AGG(
              JSONB_BUILD_OBJECT(
                  'id', steps.id, 
                  'title', steps.title,
                  'date', to_char(steps.date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
              ) 
              ORDER BY steps.date ASC
          ) FILTER (WHERE steps.id IS NOT NULL),
          '[]'::JSONB
      ) AS steps
    FROM
        selections
    LEFT JOIN
        selections_steps steps ON selections.id = steps.selection_id
    WHERE
        selections.published_at IS NOT NULL
    GROUP BY
        selections.id
    ORDER BY 
        selections.published_at DESC
    LIMIT 1;
    `,
  });

  const lastPublished = results.rows[0];

  return lastPublished;
}

async function findByIdWithSelectionGroups(id) {
  const results = await database.query({
    text: `
    SELECT
        selections.*,
        COALESCE(
          JSONB_AGG(
              JSONB_BUILD_OBJECT(
                  'id', groups.id, 
                  'title', groups.title,
                  'code', groups.code
              )
          ) FILTER (WHERE groups.id IS NOT NULL),
          '[]'::JSONB
      ) AS groups
    FROM
        selections
    LEFT JOIN
        selections_applications_groups groups ON selections.id = groups.selection_id
    WHERE
        selections.id = $1
    GROUP BY
        selections.id
    LIMIT 1;
    `,
    values: [id],
  });

  return results.rows[0];
}

async function findById(id) {
  const results = await database.query({
    text: `
    SELECT
        *
    FROM
        selections
    WHERE
        selections.id = $1;
    `,
    values: [id],
  });

  return results.rows[0];
}

export default Object.freeze({
  findLastPublishedWithSteps,
  findByIdWithSelectionGroups,
  findById,
});
