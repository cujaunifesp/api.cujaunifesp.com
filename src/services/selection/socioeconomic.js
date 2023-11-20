import application from "src/models/application";
import socioeconomic from "src/models/socioeconomic";
import applications from "src/services/selection/applications";
import { ValidationError } from "utils/errors";

async function createSocioeconomicAnswers({ applicationId, answersArray }) {
  const requestorApplication = await application.findById(applicationId);
  await applications.checkForApplicationsDate(requestorApplication);
  await checkForAnswersDuplicatesOnRequest(answersArray);

  let answersToCreate = [];

  for (let index = 0; index < answersArray.length; index++) {
    const answer = answersArray[index];
    await checkForAnswersDuplicate(answer);
    await checkForAnswerSelectionId(requestorApplication, answer);
    answersToCreate.push({
      ...answer,
      application_id: applicationId,
    });
  }

  const createdAnswers =
    socioeconomic.createSocioeconmicAnswers(answersToCreate);

  return createdAnswers;
}

async function checkForAnswerSelectionId(requestorApplication, answer) {
  try {
    const requestedQuestionOption =
      await socioeconomic.findQuestionOptionSelectionByOptionId(
        answer.socioeconomic_question_option_id,
      );

    const applicationSelectionId = requestorApplication.selection_id;
    const optionSelectionId = requestedQuestionOption.selection_id;

    if (applicationSelectionId !== optionSelectionId) {
      throw new Error();
    }
  } catch (error) {
    throw new ValidationError({
      statusCode: 422,
      message:
        "A questão que você está tentando responder não corresponte ao processo seletivo de sua inscrição",
      action: "Tente responder o formulário da sua inscrição",
    });
  }
}

async function checkForAnswersDuplicate(answer) {
  const answersCount =
    await socioeconomic.countApplicationAnswersByQuestionOptionId(
      answer.socioeconomic_question_option_id,
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

function checkForAnswersDuplicatesOnRequest(answersFromRequest) {
  const repeatedValues = answersFromRequest.filter(
    (answer, index, array) =>
      array.findIndex(
        (x) =>
          x.socioeconomic_question_option_id ===
          answer.socioeconomic_question_option_id,
      ) !== index,
  );

  if (repeatedValues.length > 0) {
    throw new ValidationError({
      message: "Você tentou responder duas vezes a mesma questão.",
      action: "Tente enviar apenas uma resposta por questão.",
      statusCode: 422,
    });
  }
}

export default Object.freeze({
  createSocioeconomicAnswers,
});
