import database from "infra/database";

async function createApplicationsAndApplyToGroups({
  applicationToCreate,
  groupsIdsToApply,
}) {
  const pool = database.getNewPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const resultsApplication = await client.query({
      text: `
      INSERT INTO applications
        (
          name, social_name, cpf, identity_document, email, phone, 
          address, zip_code, city, state, sabbatarian, special_assistance,
          special_assistance_justification, selection_id
        )
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
      `,
      values: [
        applicationToCreate.name,
        applicationToCreate.social_name,
        applicationToCreate.cpf,
        applicationToCreate.identity_document,
        applicationToCreate.email,
        applicationToCreate.phone,
        applicationToCreate.address,
        applicationToCreate.zip_code,
        applicationToCreate.city,
        applicationToCreate.state,
        applicationToCreate.sabbatarian,
        applicationToCreate.special_assistance,
        applicationToCreate.special_assistance_justification,
        applicationToCreate.selection_id,
      ],
    });

    const createdApplication = resultsApplication.rows[0];

    const selectionGroupsIds = groupsIdsToApply.map((groupId) => [
      createdApplication.id,
      groupId,
    ]);

    await client.query({
      text: `
        INSERT INTO applications_in_groups (application_id, selection_group_id)
        VALUES ${selectionGroupsIds
          .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
          .join(", ")};`,
      values: selectionGroupsIds.flat(),
    });

    await client.query("COMMIT");
    return createdApplication;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function findByIdWithSelectionGroups(id) {
  const results = await database.query({
    text: `
    SELECT
        applications.*,
        COALESCE(
          JSONB_AGG(
              JSONB_BUILD_OBJECT(
                  'id', groups.id, 
                  'title', groups.title,
                  'code', groups.code
              ) 
              ORDER BY groups.code ASC
          ) FILTER (WHERE groups.id IS NOT NULL),
          '[]'::JSONB
      ) AS selection_application_groups
    FROM
        applications
    LEFT JOIN
        applications_in_groups per_groups ON applications.id = per_groups.application_id
    LEFT JOIN
        selections_applications_groups groups ON per_groups.selection_group_id = groups.id
    WHERE
        applications.id = $1
    GROUP BY
      applications.id
    LIMIT 1;
    `,
    values: [id],
  });

  const application = results.rows[0];

  return application;
}

async function countWithSelectionAndCPF({ cpf, selectionId }) {
  const results = await database.query({
    text: `
      SELECT count(applications.id) AS applications_count
      FROM applications
      WHERE applications.cpf = $1
        AND applications.selection_id = $2;
    `,
    values: [cpf, selectionId],
  });

  return results.rows[0].applications_count;
}

async function findById(id) {
  const results = await database.query({
    text: `
      SELECT * FROM applications
      WHERE id = $1
      LIMIT 1;
    `,
    values: [id],
  });

  return results.rows[0];
}

async function findByEmail(email) {
  const results = await database.query({
    text: `
      SELECT * FROM applications
      WHERE email = $1;
    `,
    values: [email],
  });

  return results.rows;
}

async function createApplicationOrder({ applicationId, orderId }) {
  const results = await database.query({
    text: `
      INSERT INTO
        applications_orders
          (application_id, order_id)
        VALUES
          ($1, $2)
        ;
    `,
    values: [applicationId, orderId],
  });

  return results.rows[0];
}

async function findOrdersByApplicationId(applicationId) {
  const results = await database.query({
    text: `
      WITH payments AS (
        SELECT
          sum(orders_payments.total_paid_amount) FILTER(WHERE orders_payments.status = 'approved') 
          - sum(orders_payments.additional_payment_method_fee) FILTER(WHERE orders_payments.status = 'approved') AS paid_approved,
          count(orders_payments) FILTER(WHERE orders_payments.status IN ('in_process', 'in_mediation', 'pending', 'authorized')) AS pending_count, 
          count(orders_payments) AS payments_count,
          orders_payments.order_id
        FROM orders_payments
        GROUP BY orders_payments.order_id
      )
      SELECT 
        orders.*,
        CASE 
          WHEN (SELECT paid_approved FROM payments WHERE order_id = orders.id) >= orders.amount THEN 'paid'
          WHEN (SELECT paid_approved FROM payments WHERE order_id = orders.id) < orders.amount 
            AND orders.expires_at < now()
            OR (SELECT payments_count FROM payments WHERE order_id = orders.id) = 0 
            AND orders.expires_at < now()
            THEN 'not_paid'
          WHEN (SELECT pending_count FROM payments WHERE order_id = orders.id) > 0 THEN 'pending'
          ELSE 'waiting'
        END AS status
      FROM
        applications
      RIGHT JOIN
        applications_orders ON applications_orders.application_id = applications.id
      RIGHT JOIN
        orders ON orders.id = applications_orders.order_id
      WHERE
        applications.id = $1
      ORDER BY
        orders.created_at ASC;
    `,
    values: [applicationId],
  });

  return results.rows;
}

async function findPaymentsByApplicationId(applicationId) {
  const results = await database.query({
    text: `
      SELECT 
        orders_payments.*
      FROM
        applications
      RIGHT JOIN
        applications_orders ON applications_orders.application_id = applications.id
      RIGHT JOIN
        orders ON orders.id = applications_orders.order_id
      RIGHT JOIN
        orders_payments ON orders_payments.order_id = orders.id 
      WHERE
        applications.id = $1
      ORDER BY
        orders_payments.created_at ASC;
    `,
    values: [applicationId],
  });

  return results.rows;
}

export default Object.freeze({
  createApplicationsAndApplyToGroups,
  findByIdWithSelectionGroups,
  countWithSelectionAndCPF,
  findById,
  findByEmail,
  createApplicationOrder,
  findOrdersByApplicationId,
  findPaymentsByApplicationId,
});
