import application from "src/models/application";
import selection from "src/models/selection";
import socioeconomic from "src/models/socioeconomic";
import applicationsFormService from "src/services/selection/applications-form";

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

  const lastOrder = findedOrders[findedOrders.length - 1];

  if (lastOrder.rejected || lastOrder.refunded) {
    if (lastOrder.restart_on_fail) {
      const applicationToRetryOrder = await application.findById(applicationId);
      const createdOrder = await applicationsFormService.createApplicationOrder(
        applicationToRetryOrder,
      );
      findedOrders.push(createdOrder);
    }
  }

  return findedOrders;
}

export default Object.freeze({
  getCurrentSelection,
  getSocioeconomicQuestionsBySelectionId,
  getOrdersFromApplication,
});
