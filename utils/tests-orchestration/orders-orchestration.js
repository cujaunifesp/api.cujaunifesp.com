import { faker } from "@faker-js/faker";

import database from "infra/database";
import order from "src/models/order";
import ordersControl from "src/services/orders/orders-control";

async function expiresOrder(orderId) {
  await database.query({
    text: `
      UPDATE orders 
      SET expires_at = now()
      WHERE orders.id = $1;
    `,
    values: [orderId],
  });
}

async function createNewOrder(orderToCreate) {
  return await ordersControl.startOrderForUpcomingPayment({
    description: orderToCreate.description || faker.lorem.sentence({ max: 5 }),
    amount: orderToCreate.amount || faker.number.int({ min: 5, max: 5000 }),
    expires_at: orderToCreate.expires_at || faker.date.soon().toISOString(),
  });
}

async function createNewPayment(paymentToCreate) {
  return await order.createPayment({
    id: faker.string.uuid(),
    mercado_pago_id:
      paymentToCreate.mercado_pago_id ||
      faker.number.int({ min: 5, max: 5000 }),
    payer_email: paymentToCreate.payer_email || faker.internet.email(),
    payment_method_id: paymentToCreate.payment_method_id || "pix",
    payment_type_id: paymentToCreate.payment_type_id || null,
    installments: paymentToCreate.installments || 1,
    transaction_amount:
      paymentToCreate.transaction_amount ||
      faker.number.int({ min: 5, max: 5000 }),
    additional_payment_method_fee:
      paymentToCreate.additional_payment_method_fee || 0,
    total_paid_amount: paymentToCreate.total_paid_amount || 0,
    status: paymentToCreate.status || "approved",
    cause: paymentToCreate.cause || null,
    order_id: paymentToCreate.order_id,
    approved_at: paymentToCreate.approved_at || faker.date.past().toISOString(),
    updated_at: paymentToCreate.updated_at || faker.date.past().toISOString(),
  });
}

export default Object.freeze({
  expiresOrder,
  createNewOrder,
  createNewPayment,
});
