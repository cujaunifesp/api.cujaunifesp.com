import application from "src/models/application";
import socioeconomic from "src/models/socioeconomic";
import applicationsFormService from "src/services/selection/applications-form";
import { ValidationError } from "utils/errors";

async function submitSocioeconomicAnswersForApplication({
  applicationId,
  answersToSave,
}) {
  const answererApplication = await application.findById(applicationId);

  await throwIfSameOptionIds(answersToSave);
  await applicationsFormService.throwIfSelectionDeadlineOut(
    answererApplication.selection_id,
  );

  let answersToCreate = [];

  for (let index = 0; index < answersToSave.length; index++) {
    const answer = answersToSave[index];

    await throwIfAnswerDuplicates(answer);
    await throwIfSelectionAnsweredMismatchApplication({
      applicationToCheck: answererApplication,
      answerToCheck: answer,
    });

    answersToCreate.push({
      ...answer,
      application_id: applicationId,
    });
  }

  const createdAnswers =
    socioeconomic.createSocioeconmicAnswers(answersToCreate);

  return createdAnswers;
}

async function throwIfSelectionAnsweredMismatchApplication({
  applicationToCheck,
  answerToCheck,
}) {
  try {
    const requestedQuestionOption =
      await socioeconomic.findQuestionOptionSelectionByOptionId(
        answerToCheck.socioeconomic_question_option_id,
      );

    const applicationSelectionId = applicationToCheck.selection_id;
    const optionSelectionId = requestedQuestionOption.selection_id;

    if (applicationSelectionId !== optionSelectionId) {
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

async function throwIfAnswerDuplicates(answer) {
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

function throwIfSameOptionIds(answersArrayToCheck) {
  const uniqueValues = [];
  const duplicates = [];

  for (const item of answersArrayToCheck) {
    const value = item.socioeconomic_question_option_id;

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

export default Object.freeze({
  submitSocioeconomicAnswersForApplication,
});
