import authorizator from "src/services/auth/authorizator";
import selectionQueryService from "src/services/selection/selection-query";
import controller from "utils/controller";

export async function GET(request) {
  try {
    await authorizator.token().can("GET:CURRENT_SELECTION");

    const currentSelection = await selectionQueryService.getCurrentSelection();

    return controller.response.ok(200, {
      ...currentSelection,
    });
  } catch (error) {
    return controller.response.error(error);
  }
}

export const revalidate = 1800; //30 minutos
