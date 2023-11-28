import database from "infra/database";

async function findQuestionsBySelectionId(id) {
  const results = await database.query({
    text: `
      SELECT 
        questions.id,
        questions.number,
        questions.text,
        questions.description,
        questions.type,
        COALESCE(
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'id', questions_options.id, 
              'label', questions_options.label,
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

async function createSocioeconmicAnswers(answersArray) {
  const answersValues = answersArray.map((answer) => [
    answer.value,
    answer.socioeconomic_question_id,
    answer.application_id,
  ]);

  const results = await database.query({
    text: `
      INSERT INTO
        socioeconomic_answers 
        (
          value,
          socioeconomic_question_id,
          application_id
        )
        VALUES
          ${answersValues
            .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
            .join(", ")}
      RETURNING
        *
    `,
    values: answersValues.flat(),
  });

  return results.rows;
}

async function countApplicationAnswersByQuestionId(questionId, applicationId) {
  const results = await database.query({
    text: `
      SELECT
        count(socioeconomic_answers) AS answers_count
      FROM 
        socioeconomic_answers
      WHERE
        socioeconomic_answers.socioeconomic_question_id = $1
        AND socioeconomic_answers.application_id = $2;
    `,
    values: [questionId, applicationId],
  });

  return results.rows[0].answers_count;
}

async function findQuestionById(questionId) {
  const results = await database.query({
    text: `
      SELECT 
        *
      FROM
        socioeconomic_questions
      WHERE
        id = $1;
    `,
    values: [questionId],
  });

  return results.rows[0];
}

export default Object.freeze({
  findQuestionsBySelectionId,
  createSocioeconmicAnswers,
  countApplicationAnswersByQuestionId,
  findQuestionById,
});
