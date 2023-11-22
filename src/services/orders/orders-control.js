import order from "src/models/order";

async function startOrderForUpcomingPayment(orderToCreate) {
  const createdOrder = await order.create({
    description: orderToCreate.description || null,
    amount: orderToCreate.amount || 0,
    paid: orderToCreate.paid || false,
    status: "pending",
    expires_at: orderToCreate.expires_at,
    closed_at: orderToCreate.closed_at,
  });

  return createdOrder;
}

export default Object.freeze({
  startOrderForUpcomingPayment,
});
