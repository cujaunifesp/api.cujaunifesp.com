import database from "infra/database";

async function create(orderToCreate) {
  const results = await database.query({
    text: `
      INSERT INTO
        orders 
          ( 
            description, total_amount, restart_on_fail, 
            status, paid, rejected, refunded, 
            rejected_at, expires_at
          )
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `,
    values: [
      orderToCreate.description,
      orderToCreate.total_amount,
      orderToCreate.restart_on_fail,
      orderToCreate.status,
      orderToCreate.paid,
      orderToCreate.rejected,
      orderToCreate.refunded,
      orderToCreate.rejected_at,
      orderToCreate.expires_at,
    ],
  });

  return results.rows[0];
}

export default Object.freeze({
  create,
});
