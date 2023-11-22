import database from "infra/database";

async function create(orderToCreate) {
  const results = await database.query({
    text: `
      INSERT INTO
        orders 
          ( 
            description, amount, status,
            paid, closed_at, expires_at
          )
        VALUES
          ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
    values: [
      orderToCreate.description,
      orderToCreate.amount,
      orderToCreate.status,
      orderToCreate.paid,
      orderToCreate.closed_at,
      orderToCreate.expires_at,
    ],
  });

  return results.rows[0];
}

async function findById(orderId) {
  const results = await database.query({
    text: `
      SELECT * FROM orders
      WHERE orders.id = $1;
    `,
    values: [orderId],
  });

  return results.rows[0];
}

async function createPayment(paymentToCreate) {
  const results = await database.query({
    text: `
      INSERT INTO 
        orders_payments
          (
            id, mercado_pago_id, payer_email, payment_method_id,
            payment_type_id, installments, transaction_amount,
            additional_fee_amount, total_paid_amount, status,
            cause, order_id, approved_at, updated_at
          )
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
    `,
    values: [
      paymentToCreate.id,
      paymentToCreate.mercado_pago_id,
      paymentToCreate.payer_email,
      paymentToCreate.payment_method_id,
      paymentToCreate.payment_type_id,
      paymentToCreate.installments,
      paymentToCreate.transaction_amount,
      paymentToCreate.additional_fee_amount,
      paymentToCreate.total_paid_amount,
      paymentToCreate.status,
      paymentToCreate.cause,
      paymentToCreate.order_id,
      paymentToCreate.approved_at,
      paymentToCreate.updated_at,
    ],
  });

  return results.rows[0];
}

export default Object.freeze({
  create,
  findById,
  createPayment,
});
