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

    const application_id = requestedApplication.id;

    await authorizator.request(request.headers).can("GET:APPLICATIONS_ORDERS", {
      resource: { application_id },
    });

    const ordersFromApplication =
      await selectionQueryService.getOrdersFromApplication(application_id);

    return controller.response.ok(200, [...ordersFromApplication]);
  } catch (error) {
    return controller.response.error(error);
  }
}

export const revalidate = 0;
