import database from "infra/database";

async function findQuestionsBySelectionId(id) {
  const results = await database.query({
    text: `
      SELECT 
        questions.id,
        questions.number,
        questions.text,
        COALESCE(
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'id', questions_options.id, 
              'label', questions_options.label,
              'type', questions_options.type,
              'number', questions_options.number
            ) 
            ORDER BY questions_options.number ASC
          ) FILTER (WHERE questions_options.id IS NOT NULL),
          '[]'::JSONB
        ) AS options
      FROM 
        socioeconomic_questions questions
      LEFT JOIN
        socioeconomic_questions_options questions_options ON questions.id = questions_options.socioeconomic_question_id
      WHERE
        questions.selection_id = $1
      GROUP BY
        questions.id
      ORDER BY 
        questions.number ASC;
    `,
    values: [id],
  });

  return results.rows;
}

export default Object.freeze({
  findQuestionsBySelectionId,
});
