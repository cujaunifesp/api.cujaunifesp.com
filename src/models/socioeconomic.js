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

async function createSocioeconmicAnswers(answersArray) {
  const results = await database.query({
    text: `
      INSERT INTO
        socioeconomic_answers 
        (
          value,
          socioeconomic_question_option_id,
          application_id
        )
        VALUES
          ${createValuesString()}
      RETURNING
        *
    `,
    values: answersArray.reduce((previous, current) => {
      return [
        ...previous,
        current.value,
        current.socioeconomic_question_option_id,
        current.application_id,
      ];
    }, []),
  });

  function createValuesLine(lineNumber) {
    const base = lineNumber * 3;
    return `($${base + 1}, $${base + 2}, $${base + 3})`;
  }

  function createValuesString() {
    const string = answersArray.reduce((previous, current, index) => {
      return (
        previous +
        `${createValuesLine(index)},
`
      );
    }, "");

    return string.slice(0, -2);
  }

  return results.rows;
}

async function findQuestionOptionSelectionByOptionId(optionId) {
  const results = await database.query({
    text: `
      SELECT 
        selections.id AS selection_id,
        selections.title AS selection_title,
        questions.id AS question_id,
        questions.text AS question_text,
        options.id AS option_id,
        options.label AS option_label
      FROM
        socioeconomic_questions_options options
      LEFT JOIN
        socioeconomic_questions questions ON options.socioeconomic_question_id = questions.id
      LEFT JOIN
        selections ON questions.selection_id = selections.id
      WHERE
        options.id = $1;
    `,
    values: [optionId],
  });

  return results.rows[0];
}

async function countApplicationAnswersByQuestionOptionId(optionId) {
  const results = await database.query({
    text: `
      SELECT
        count(socioeconomic_answers.id) AS answers_count
      FROM 
        socioeconomic_answers
      WHERE
        socioeconomic_answers.socioeconomic_question_option_id = $1;
    `,
    values: [optionId],
  });

  return results.rows[0].answers_count;
}

export default Object.freeze({
  findQuestionsBySelectionId,
  createSocioeconmicAnswers,
  findQuestionOptionSelectionByOptionId,
  countApplicationAnswersByQuestionOptionId,
});
