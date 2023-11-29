import { MercadoPagoConfig, Payment } from "mercadopago";

import application from "src/models/application";
import selection from "src/models/selection";
import socioeconomic from "src/models/socioeconomic";

async function getCurrentSelection() {
  const currentSelection = await selection.findLastPublishedWithSteps();
  return currentSelection;
}

async function getSocioeconomicQuestionsBySelectionId(id) {
  const socioecocomicQuestions =
    await socioeconomic.findQuestionsBySelectionId(id);
  return socioecocomicQuestions;
}

async function getOrderFromApplication(applicationId) {
  const findedOrder = await application.findOrderByApplicationId(applicationId);
  return findedOrder;
}

async function getPaymentsFromApplication(applicationId) {
  const findedPayments =
    await application.findPaymentsByApplicationId(applicationId);
  return findedPayments;
}

async function getSelectionApplicationsGroups(selectionId) {
  const findedGroups =
    await selection.findApplicationsGroupsBySelectionId(selectionId);
  return findedGroups;
}

async function getApplication(applicationId) {
  const findedApplication =
    await application.findByIdWithSelectionGroups(applicationId);
  return findedApplication;
}

async function searchApplicationsByEmail(emailToSearch) {
  const findedApplications =
    await application.findByEmailWithSelectionGroups(emailToSearch);
  return findedApplications;
}

async function getApplicationAnswers(applicationId) {
  const findedAnswers =
    await socioeconomic.findAnswersByApplicationId(applicationId);
  return findedAnswers;
}

export default Object.freeze({
  getCurrentSelection,
  getSocioeconomicQuestionsBySelectionId,
  getOrderFromApplication,
  getSelectionApplicationsGroups,
  getPaymentsFromApplication,
  getApplication,
  searchApplicationsByEmail,
  getApplicationAnswers,
});
