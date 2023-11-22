import order from "src/models/order";
import authorizator from "src/services/auth/authorizator";
import paymentProcessorService from "src/services/orders/payment-processor";
import controller from "utils/controller";
import validator from "utils/validator";

const requestBodySchema = {
  installments: {
    type: validator.types.INTEGER,
  },
  token: {
    type: validator.types.STRING,
  },
  payment_method_id: {
    required: true,
    type: validator.types.STRING,
  },
  issuer_id: {
    type: validator.types.STRING,
  },
  payer: {
    required: true,
    type: validator.types.OBJECT,
  },
};

const requestBodyPayerSchema = {
  first_name: {
    type: validator.types.STRING_TRIM,
  },
  last_name: {
    type: validator.types.STRING_TRIM,
  },
  email: {
    required: true,
    type: validator.types.EMAIL,
  },
  identification: {
    type: validator.types.OBJECT_WITH_SCHEMA,
    objectSchema: {
      type: validator.types.STRING_UPPERCASE,
      number: validator.types.STRING_TRIM,
    },
  },
  address: {
    type: validator.types.OBJECT_WITH_SCHEMA,
    objectSchema: {
      zip_code: validator.types.STRING_TRIM,
      federal_unit: validator.types.STRING_TRIM,
      city: validator.types.STRING_TRIM,
      neighborhood: validator.types.STRING_TRIM,
      street_name: validator.types.STRING_TRIM,
      street_number: validator.types.STRING_TRIM,
    },
  },
};

export async function POST(request, { params }) {
  try {
    const requestedOrder = await controller.request.getResourceByRequestParams({
      idParam: params.id,
      resourceModel: order,
    });

    const requestBody = await request.json();
    const requestBodyPayer = requestBody.payer || {};

    const secureRequestBody = validator.run(requestBody, requestBodySchema);

    const secureRequestPayer = validator.run(
      requestBodyPayer,
      requestBodyPayerSchema,
    );

    secureRequestBody.payer = secureRequestPayer;

    await authorizator.token().can("POST:ORDERS_PAYMENTS");

    const paidPayment = await paymentProcessorService.startPaymentOrder({
      orderToPayId: requestedOrder.id,
      paymentDetails: secureRequestBody,
    });

    return controller.response.ok(201, { ...paidPayment });
  } catch (error) {
    return controller.response.error(error);
  }
}
