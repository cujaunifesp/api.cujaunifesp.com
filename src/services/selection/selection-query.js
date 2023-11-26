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

async function getOrdersFromApplication(applicationId) {
  const findedOrders =
    await application.findOrdersByApplicationId(applicationId);
  return findedOrders;
}

async function getSelectionApplicationsGroups(selectionId) {
  const findedGroups =
    await selection.findApplicationsGroupsBySelectionId(selectionId);
  return findedGroups;
}

async function getApplication(applicationId) {
  const findedApplication = await application.findById(applicationId);
  return findedApplication;
}

export default Object.freeze({
  getCurrentSelection,
  getSocioeconomicQuestionsBySelectionId,
  getOrdersFromApplication,
  getSelectionApplicationsGroups,
  getApplication,
});
