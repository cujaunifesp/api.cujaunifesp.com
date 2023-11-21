import database from "infra/database";

async function rejectOrder(orderId) {
  await database.query({
    text: `
      UPDATE orders 
      SET rejected = true, rejected_at = now()
      WHERE orders.id = $1;
    `,
    values: [orderId],
  });
}

export default Object.freeze({
  rejectOrder,
});
