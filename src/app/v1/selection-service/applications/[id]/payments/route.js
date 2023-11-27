import application from "src/models/application";
import authorizator from "src/services/auth/authorizator";
import selectionQueryService from "src/services/selection/selection-query";
import controller from "utils/controller";

export async function GET(request, { params }) {
  try {
    const requestedApplication =
      await controller.request.getResourceByRequestParams({
        idParam: params.id,
        resourceModel: application,
      });

    await authorizator
      .request(request.headers)
      .can("GET:APPLICATIONS_PAYMENTS", {
        resource: requestedApplication,
      });

    const paymentsFromApplication =
      await selectionQueryService.getPaymentsFromApplication(
        requestedApplication.id,
      );

    return controller.response.ok(200, [...paymentsFromApplication]);
  } catch (error) {
    return controller.response.error(error);
  }
}
