import selection from "src/models/selection";

async function getCurrentSelection() {
  const currentSelection = await selection.findLastPublishedWithSteps();
  return currentSelection;
}

export default Object.freeze({
  getCurrentSelection,
});
