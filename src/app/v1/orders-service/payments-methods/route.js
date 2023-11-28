import authorizator from "src/services/auth/authorizator";
import paymentMethodsServices from "src/services/orders/payment-methods";
import controller from "utils/controller";

export async function GET(request) {
  try {
    await authorizator.token().can("GET:PAYMENTS_METHODS");

    const paymentsMethods =
      await paymentMethodsServices.getAvailablePaymentMethods();

    return controller.response.ok(200, paymentsMethods);
  } catch (error) {
    return controller.response.error(error);
  }
}

export const revalidate = 30; //30 segundos
