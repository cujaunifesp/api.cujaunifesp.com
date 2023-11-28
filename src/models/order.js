import database from "infra/database";

async function create(orderToCreate) {
  const results = await database.query({
    text: `
      INSERT INTO
        orders 
          ( 
            title, description, amount, expires_at
          )
        VALUES
          ($1, $2, $3, $4)
      RETURNING *;
    `,
    values: [
      orderToCreate.title,
      orderToCreate.description,
      orderToCreate.amount,
      orderToCreate.expires_at,
    ],
  });

  return results.rows[0];
}

async function findById(orderId) {
  const results = await database.query({
    text: `
      WITH payments AS (
        SELECT
          sum(orders_payments.total_paid_amount) FILTER(WHERE orders_payments.status = 'approved') 
          - sum(orders_payments.additional_payment_method_fee) FILTER(WHERE orders_payments.status = 'approved') AS paid_approved,
          count(orders_payments) FILTER(WHERE orders_payments.status IN ('in_process', 'in_mediation', 'pending', 'authorized')) AS pending_count, 
          count(orders_payments) AS payments_count 
        FROM orders_payments
        WHERE orders_payments.order_id = $1
      )
      SELECT 
        orders.*,
        CASE 
          WHEN (SELECT paid_approved FROM payments) >= orders.amount THEN 'paid'
          WHEN (SELECT paid_approved FROM payments) < orders.amount 
            AND orders.expires_at < now()
            OR (SELECT payments_count FROM payments) = 0 
            AND orders.expires_at < now()
            THEN 'not_paid'
          WHEN (SELECT pending_count FROM payments) > 0 THEN 'pending'
          ELSE 'waiting'
        END AS status
      FROM orders
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
            additional_payment_method_fee, total_paid_amount, status,
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
      paymentToCreate.additional_payment_method_fee,
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

async function updatePaymentStatus(paymentToUpdate) {
  const results = await database.query({
    text: `
      UPDATE 
        orders_payments
      SET 
        total_paid_amount = $1, 
        status = $2, 
        approved_at = $3, 
        updated_at = $4,
        payer_email = $5
      WHERE
        orders_payments.id = $6
      RETURNING *
      ;
    `,
    values: [
      paymentToUpdate.total_paid_amount,
      paymentToUpdate.status,
      paymentToUpdate.approved_at,
      paymentToUpdate.updated_at,
      paymentToUpdate.payer_email,
      paymentToUpdate.id,
    ],
  });

  return results.rows[0];
}

export default Object.freeze({
  create,
  findById,
  createPayment,
  updatePaymentStatus,
});
