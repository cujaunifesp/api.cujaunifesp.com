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
        selection_steps steps ON selections.id = steps.selection_id
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

export default Object.freeze({
  findLastPublishedWithSteps,
});
