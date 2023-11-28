import order from "src/models/order";

async function startOrderForUpcomingPayment(orderToCreate) {
  const createdOrder = await order.create({
    description: orderToCreate.description || null,
    amount: orderToCreate.amount || 0,
    expires_at: orderToCreate.expires_at,
    title: orderToCreate.title,
  });

  return createdOrder;
}

export default Object.freeze({
  startOrderForUpcomingPayment,
});
