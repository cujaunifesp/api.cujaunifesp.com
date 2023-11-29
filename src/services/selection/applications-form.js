import email from "infra/email-sender/email";
import application from "src/models/application";
import selection from "src/models/selection";
import ordersControlService from "src/services/orders/orders-control";
import { ValidationError } from "utils/errors";

async function applyToSelection(applicationToApply) {
  await throwIfSelectionDeadlineOut(applicationToApply.selection_id);
  await throwIfDuplicateApplicationsForCPF(applicationToApply);
  await throwIfDuplicateApplicationsForEmail(applicationToApply);

  const createdAppplication =
    await application.createApplicationsAndApplyToGroups({
      applicationToCreate: applicationToApply,
      groupsIdsToApply: applicationToApply.selected_groups_ids,
    });

  const queriedApplication = await application.findByIdWithSelectionGroups(
    createdAppplication.id,
  );

  const createdOrder = await createApplicationOrder(queriedApplication);

  await email.sendWithTemplate({
    to: queriedApplication.email,
    subject: "Acompanhe a sua inscrição",
    template: email.templates.newApplication,
    replacements: {},
  });

  return queriedApplication;
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

async function throwIfDuplicateApplicationsForCPF(applicationToCheck) {
  const applicationsCount = await application.countWithSelectionAndCPF({
    cpf: applicationToCheck.cpf,
    selectionId: applicationToCheck.selection_id,
  });

  if (applicationsCount > 0) {
    throw new ValidationError({
      message: "Esse CPF já está sendo usado em outra inscrição.",
      action: "Entre em contato com o suporte se acreditar que isso é um erro.",
      statusCode: 422,
    });
  }
}

async function throwIfDuplicateApplicationsForEmail(applicationToCheck) {
  const applicationsCount = await application.countWithSelectionAndEmail({
    email: applicationToCheck.email,
    selectionId: applicationToCheck.selection_id,
  });

  if (applicationsCount > 0) {
    throw new ValidationError({
      message: "Esse email já está sendo usado em outra inscrição.",
      action: "Entre em contato com o suporte se acreditar que isso é um erro.",
      statusCode: 422,
    });
  }
}

async function createApplicationOrder(applicationToPay) {
  const selectionFromApplication = await selection.findById(
    applicationToPay.selection_id,
  );

  const createdOrder = await ordersControlService.startOrderForUpcomingPayment({
    description: "Taxa de inscrição no processo seletivo do CUJA",
    amount: selectionFromApplication.application_price,
    expires_at: selectionFromApplication.applications_end_date.toISOString(),
    title: "Inscrição CUJA",
  });

  await assignOrderToApplication({
    orderId: createdOrder.id,
    applicationId: applicationToPay.id,
  });

  return createdOrder;
}

async function assignOrderToApplication({ orderId, applicationId }) {
  await application.createApplicationOrder({ orderId, applicationId });
}

export default Object.freeze({
  applyToSelection,
  throwIfSelectionDeadlineOut,
  createApplicationOrder,
});
