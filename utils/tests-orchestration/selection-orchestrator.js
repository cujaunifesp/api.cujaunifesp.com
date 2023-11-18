import database from "infra/database";

async function createNewSelection(selectionObject) {
  const now = new Date();

  const selection = {
    title: selectionObject?.title || "Processo Seletivo",
    description:
      selectionObject?.description ||
      "Esse é o processo seletivo de alunos do CUJA",
    exam_date: selectionObject?.exam_date?.toISOString() || now.toISOString(),
    applications_start_date:
      selectionObject?.applications_start_date?.toISOString() ||
      now.toISOString(),
    applications_end_date:
      selectionObject?.applications_end_date?.toISOString() ||
      now.toISOString(),
    published_at: selectionObject?.published_at || null,
  };

  const results = await database.query({
    text: `
      INSERT INTO
        selections (title, description, exam_date, applications_start_date, applications_end_date, published_at)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        *
      ;`,
    values: [
      selection.title,
      selection.description,
      selection.exam_date,
      selection.applications_start_date,
      selection.applications_end_date,
      selection.published_at,
    ],
  });

  const newSelection = results.rows[0];

  return newSelection;
}

async function createNewSelectionStep(selectionStepObject) {
  const selectionStep = {
    title: selectionStepObject?.title || "Etapa de teste",
    date: selectionStepObject?.date?.toISOString() || new Date().toISOString(),
    selection_id: selectionStepObject?.selection_id,
  };

  const results = await database.query({
    text: `
      INSERT INTO
        selections_steps (title, date, selection_id)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
    values: [
      selectionStep.title,
      selectionStep.date,
      selectionStep.selection_id,
    ],
  });

  const newSelectionStep = results.rows[0];

  return newSelectionStep;
}

export default Object.freeze({
  createNewSelection,
  createNewSelectionStep,
});
