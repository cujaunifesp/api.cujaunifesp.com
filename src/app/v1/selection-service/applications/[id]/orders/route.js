import authorizator from "src/services/auth/authorizator";
import selectionQueryService from "src/services/selection/selection-query";
import controller from "utils/controller";
import { NotFoundError } from "utils/errors";
import validator from "utils/validator";

export async function GET(request, { params }) {
  const application_id = params.id;

  try {
    validator.run(
      { application_id },
      {
        application_id: {
          required: true,
          type: validator.types.UUID,
        },
      },
    );
  } catch (error) {
    return controller.response.error(new NotFoundError({}));
  }

  try {
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
