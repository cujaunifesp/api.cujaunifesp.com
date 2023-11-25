import paymentProcessorService from "src/services/orders/payment-processor";
import controller from "utils/controller";
import validator from "utils/validator";

const requestBodySchema = {
  id: {
    required: true,
    type: validator.types.INTEGER,
  },
  live_mode: {
    required: true,
    type: validator.types.BOOLEAN,
  },
  type: {
    required: true,
    type: validator.types.STRING,
  },
  date_created: {
    required: true,
    type: validator.types.STRING,
  },
  user_id: {
    required: true,
    type: validator.types.INTEGER,
  },
  api_version: {
    required: true,
    type: validator.types.STRING,
  },
  action: {
    required: true,
    type: validator.types.STRING,
  },
  data: {
    required: true,
    type: validator.types.OBJECT_WITH_SCHEMA,
    objectSchema: {
      id: validator.types.STRING,
    },
  },
};

export async function POST(request) {
  try {
    const requestBody = await request.json();

    const secureRequestBody = validator.run(requestBody, requestBodySchema);

    const updatedPayment =
      await paymentProcessorService.requestPaymentStatusUpdate(
        secureRequestBody.data.id,
      );

    return controller.response.ok(201, {});
  } catch (error) {
    return controller.response.error(error);
  }
}
