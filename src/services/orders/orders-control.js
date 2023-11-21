import order from "src/models/order";

async function startOrderForUpcomingPayment(orderToCreate) {
  const createdOrder = await order.create({
    description: orderToCreate.description || null,
    total_amount: orderToCreate.total_amount || 0,
    restart_on_fail: orderToCreate.restart_on_fail || true,
    paid: orderToCreate.paid || false,
    refunded: orderToCreate.refunded || false,
    rejected: orderToCreate.rejected || false,
    status: "pending",
    expires_at: orderToCreate.expires_at,
  });

  return createdOrder;
}

export default Object.freeze({
  startOrderForUpcomingPayment,
});
