import { MercadoPagoConfig, PaymentMethod } from "mercadopago";

async function getAvailablePaymentMethods() {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
  });

  const paymentMethods = new PaymentMethod(client);
  const findedMethods = await paymentMethods.get();

  const paymentMethodsAdditionalFees = {
    pec: 3.5,
    bolbradesco: 3.5,
  };

  const excludedPaymentMethods = ["debelo", "account_money"];

  const availableMethods = findedMethods
    .filter((method) => method.status === "active")
    .filter((method) => !excludedPaymentMethods.includes(method.id))
    .map((method) => {
      return {
        payment_method_id: method.id,
        name: method.name,
        payment_type_id: method.payment_type_id,
        additional_fee: paymentMethodsAdditionalFees[method.id] || 0,
        min_allowed_amount: method.min_allowed_amount,
        max_allowed_amount: method.max_allowed_amount,
      };
    });

  return availableMethods;
}

export default Object.freeze({
  getAvailablePaymentMethods,
});
