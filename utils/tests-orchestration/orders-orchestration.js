import { faker } from "@faker-js/faker";

import database from "infra/database";
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
    paid: orderToCreate.paid || false,
    status: orderToCreate.status || "pending",
    expires_at: orderToCreate.expires_at || faker.date.soon().toISOString(),
    closed_at: orderToCreate.closed_at || null,
  });
}

export default Object.freeze({
  expiresOrder,
  createNewOrder,
});
