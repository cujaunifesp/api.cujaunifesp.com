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

export default Object.freeze({
  getCurrentSelection,
  getSocioeconomicQuestionsBySelectionId,
  getOrdersFromApplication,
});
