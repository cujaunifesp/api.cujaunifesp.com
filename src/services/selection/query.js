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

export default Object.freeze({
  getCurrentSelection,
  getSocioeconomicQuestionsBySelectionId,
});
