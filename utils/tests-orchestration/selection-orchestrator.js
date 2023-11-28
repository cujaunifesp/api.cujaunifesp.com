import { faker, simpleFaker } from "@faker-js/faker";

import database from "infra/database";
import application from "src/models/application";
import applicationsFormService from "src/services/selection/applications-form";
import selectionQueryService from "src/services/selection/selection-query";

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
    application_price: selectionObject?.application_price || 0,
  };

  const results = await database.query({
    text: `
      INSERT INTO
        selections (title, description, exam_date, applications_start_date, applications_end_date, published_at, application_price)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
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
      selection.application_price,
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

async function createNewSelectionGroup(selectionGroup) {
  const results = await database.query({
    text: `
      INSERT INTO
        selections_applications_groups (title, code, selection_id)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
    values: [
      selectionGroup.title || "Reserva de vagas",
      selectionGroup.code || "T",
      selectionGroup.selection_id,
    ],
  });

  const newSelectionGroup = results.rows[0];

  return newSelectionGroup;
}

async function createNewSocioeconomicQuestion(question) {
  const results = await database.query({
    text: `
      INSERT INTO
        socioeconomic_questions (text, selection_id, number, type)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        *
      ;`,
    values: [
      question.text || "Qual é a sua resposta?",
      question.selection_id,
      question.number || null,
      question.type || "string",
    ],
  });

  const newQuestion = results.rows[0];

  return newQuestion;
}

async function createNewSocioeconomicQuestionOption(questionOption) {
  const results = await database.query({
    text: `
      INSERT INTO
        socioeconomic_questions_options (label, socioeconomic_question_id, number)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
    values: [
      questionOption.label || "Resposta letra A",
      questionOption.socioeconomic_question_id,
      questionOption.number || null,
    ],
  });

  const newQuestionOption = results.rows[0];

  return newQuestionOption;
}

async function createNewApplication(applicationObject) {
  const createdApplication = applicationsFormService.applyToSelection({
    name: applicationObject.name || faker.person.fullName(),
    email: applicationObject.email || faker.internet.email(),
    phone: applicationObject.phone || faker.phone.number(),
    cpf: applicationObject.cpf || "999.999.999-99",
    identity_document:
      applicationObject.identity_document || simpleFaker.string.numeric(9),
    address: applicationObject.address || faker.location.streetAddress(),
    zip_code: applicationObject.zip_code || faker.location.zipCode(),
    city: applicationObject.city || faker.location.city(),
    state: applicationObject.state || faker.location.state(),
    sabbatarian:
      applicationObject.sabbatarian || simpleFaker.datatype.boolean(),
    special_assistance:
      applicationObject.special_assistance || simpleFaker.datatype.boolean(),
    special_assistance_justification:
      applicationObject.special_assistance_justification ||
      faker.lorem.sentence({ max: 6 }),
    selected_groups_ids: applicationObject.selected_groups_ids || [],
    selection_id: applicationObject.selection_id || simpleFaker.string.uuid(),
  });

  return createdApplication;
}

async function closeSelectionApplications(selectionId) {
  await database.query({
    text: `
      UPDATE selections SET applications_end_date = now() WHERE selections.id = $1
    `,
    values: [selectionId],
  });
}

async function getApplicationOrders(applicationId) {
  const findedOrders =
    await selectionQueryService.getOrdersFromApplication(applicationId);
  return findedOrders;
}

async function createApplicationOrder(applicationId) {
  const applicationToCreateOrder = await application.findById(applicationId);
  const createdOrder = await applicationsFormService.createApplicationOrder(
    applicationToCreateOrder,
  );

  return createdOrder;
}

export default Object.freeze({
  createNewSelection,
  createNewSelectionStep,
  createNewSelectionGroup,
  createNewSocioeconomicQuestion,
  createNewSocioeconomicQuestionOption,
  createNewApplication,
  closeSelectionApplications,
  getApplicationOrders,
  createApplicationOrder,
});
