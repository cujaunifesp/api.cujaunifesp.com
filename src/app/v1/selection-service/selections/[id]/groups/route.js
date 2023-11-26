import selection from "src/models/selection";
import authorizator from "src/services/auth/authorizator";
import selectionQueryService from "src/services/selection/selection-query";
import controller from "utils/controller";
import validator from "utils/validator";

export async function GET(request, { params }) {
  try {
    const requestedSelection =
      await controller.request.getResourceByRequestParams({
        idParam: params.id,
        resourceModel: selection,
      });

    const selection_id = requestedSelection.id;
    const secureParams = validator.run(
      { selection_id },
      {
        selection_id: { required: true, type: validator.types.UUID },
      },
    );

    await authorizator.request(request.headers).can("GET:SELECTION_GROUPS");

    const selectionGroups =
      await selectionQueryService.getSelectionApplicationsGroups(
        secureParams.selection_id,
      );

    return controller.response.ok(200, [...selectionGroups]);
  } catch (error) {
    return controller.response.error(error);
  }
}
