import application from "src/models/application";
import selection from "src/models/selection";
import socioeconomic from "src/models/socioeconomic";
import { ValidationError } from "utils/errors";
import validator from "utils/validator";

async function submitSocioeconomicAnswersForApplication({
  applicationId,
  answersToSave,
}) {
  const answererApplication = await application.findById(applicationId);
  const questions = await socioeconomic.findQuestionsBySelectionId(
    answererApplication.selection_id,
  );

  await throwIfSameQuestionsIds(answersToSave);
  await throwIfSelectionDeadlineOut(answererApplication.selection_id);

  let answersToCreate = [];

  for (let index = 0; index < answersToSave.length; index++) {
    const answer = answersToSave[index];

    await throwIfAnswerDuplicates(answer, answererApplication.id);
    await throwIfSelectionAnsweredMismatchApplication({
      applicationToCheck: answererApplication,
      answerToCheck: answer,
    });
    await throwIfInvalidAnswerValue(
      answer,
      questions.find(
        (question) => question.id === answer.socioeconomic_question_id,
      ),
    );

    answersToCreate.push({
      ...answer,
      application_id: applicationId,
    });
  }

  const createdAnswers =
    await socioeconomic.createSocioeconmicAnswers(answersToCreate);

  return createdAnswers;
}

async function throwIfSelectionAnsweredMismatchApplication({
  applicationToCheck,
  answerToCheck,
}) {
  try {
    const requestedQuestion = await socioeconomic.findQuestionById(
      answerToCheck.socioeconomic_question_id,
    );

    const applicationSelectionId = applicationToCheck.selection_id;
    const questionSelectionId = requestedQuestion.selection_id;

    if (applicationSelectionId !== questionSelectionId) {
      throw new Error();
    }
  } catch (error) {
    throw new ValidationError({
      statusCode: 422,
      message:
        "A questão que você está tentando responder não corresponte ao processo seletivo de sua inscrição.",
      action: "Responda apenas o formulário referente a sua inscrição.",
    });
  }
}

async function throwIfAnswerDuplicates(answer, applicationId) {
  const answersCount = await socioeconomic.countApplicationAnswersByQuestionId(
    answer.socioeconomic_question_id,
    applicationId,
  );

  if (answersCount > 0) {
    throw new ValidationError({
      message:
        "Você está tentando responder uma questão que você já respondeu antes.",
      action: "Entre em contato com o suporte se acreditar que isso é um erro.",
      statusCode: 422,
    });
  }
}

function throwIfSameQuestionsIds(answersArrayToCheck) {
  const uniqueValues = [];
  const duplicates = [];

  for (const item of answersArrayToCheck) {
    const value = item.socioeconomic_question_id;

    if (uniqueValues.includes(value)) {
      duplicates.push(value);
    } else {
      uniqueValues.push(value);
    }
  }

  if (duplicates.length > 0) {
    throw new ValidationError({
      message: "Você enviou duas respostas para a mesma questão.",
      action: "Tente enviar apenas uma resposta por questão.",
      statusCode: 422,
    });
  }
}

async function throwIfSelectionDeadlineOut(selectionId) {
  const selectionToCheck = await selection.findById(selectionId);

  const applicationsEndDate = new Date(selectionToCheck.applications_end_date);
  const applicationsStartDate = new Date(
    selectionToCheck.applications_start_date,
  );

  const now = new Date();

  if (now < applicationsStartDate || now > applicationsEndDate) {
    throw new ValidationError({
      message: "As inscrições para esse processo seletivo não estão abertas",
      action: "Confira as datas para inscrição através do site",
      statusCode: 422,
    });
  }
}

async function throwIfInvalidAnswerValue(answer, question) {
  const valuesTypes = {
    text: validator.types.STRING_NOT_UUID,
    number: validator.types.STRING_INTEGER,
    multiple_choice: validator.types.UUID,
  };

  await validator.run(
    { answerValue: answer.value },
    {
      answerValue: {
        required: true,
        type: valuesTypes[question.type],
      },
    },
  );
}

async function resetApplicationAnswers(applicationId) {
  const deletedAnswers =
    await socioeconomic.deleteAnswersByApplicationId(applicationId);
  return deletedAnswers;
}

export default Object.freeze({
  submitSocioeconomicAnswersForApplication,
  resetApplicationAnswers,
});
