import application from "src/models/application";
import selection from "src/models/selection";
import { ValidationError } from "utils/errors";

async function submitNewApplication(applicationObject) {
  await checkForApplicationsDate(applicationObject);
  await checkForCPFDuplicate(applicationObject);

  const createdAppplication =
    await application.createApplicationsWithSelectionGroups(applicationObject);

  const createdQueriedApplication =
    await application.findByIdWithSelectionGroups(createdAppplication.id);

  return createdQueriedApplication;
}

async function checkForApplicationsDate(submitedApplication) {
  const requiredSelection = await selection.findByIdWithSelectionGroups(
    submitedApplication.selection_id,
  );

  const applicationsStartDate = new Date(
    requiredSelection.applications_start_date,
  );
  const applicationsEndDate = new Date(requiredSelection.applications_end_date);
  const now = new Date();

  if (now > applicationsStartDate && now < applicationsEndDate) {
    return "ok";
  } else {
    throw new ValidationError({
      message: "As inscrições para esse processo seletivo não estão abertas",
      action: "Confira as datas para inscrição através do site",
      statusCode: 422,
    });
  }
}

async function checkForCPFDuplicate(submitedApplication) {
  const userApplication = await application.findUserApplicationDuplicates({
    cpf: submitedApplication.cpf,
    selection_id: submitedApplication.selection_id,
  });

  if (userApplication.applications_count > 0) {
    throw new ValidationError({
      message: "Esse CPF já está sendo usado em outra isncrição.",
      action: "Entre em contato com o suporte se acreditar que isso é um erro.",
      statusCode: 422,
    });
  }
}

export default Object.freeze({
  submitNewApplication,
  checkForApplicationsDate,
});
