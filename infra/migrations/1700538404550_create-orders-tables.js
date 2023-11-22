/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("orders", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    description: {
      type: "varchar(255)",
    },

    amount: {
      type: "decimal(6,2)",
      notNull: true,
    },

    status: {
      type: "varchar(255)",
    },

    paid: {
      type: "boolean",
      default: false,
      notNull: true,
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },

    closed_at: {
      type: "timestamp with time zone",
    },

    expires_at: {
      type: "timestamp with time zone",
    },
  });

  pgm.createTable("orders_payments", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    mercado_pago_id: {
      type: "integer",
    },

    payer_email: {
      type: "varchar(255)",
      notNull: true,
    },

    payment_method_id: {
      type: "varchar(100)",
      notNull: true,
    },

    payment_type_id: {
      type: "varchar(100)",
    },

    installments: {
      type: "integer",
      notNull: true,
      default: 1,
    },

    transaction_amount: {
      type: "decimal(6,2)",
      notNull: true,
    },

    additional_fee_amount: {
      type: "decimal(6,2)",
      notNull: true,
    },

    total_paid_amount: {
      type: "decimal(6,2)",
    },

    status: {
      type: "varchar(100)",
      notNull: true,
    },

    cause: {
      type: "varchar(255)",
    },

    order_id: {
      type: "uuid",
      references: "orders",
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      notNull: true,
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },

    approved_at: {
      type: "timestamp with time zone",
    },

    updated_at: {
      type: "timestamp with time zone",
    },
  });

  pgm.createTable("applications_orders", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    application_id: {
      type: "uuid",
      references: "applications",
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      notNull: true,
    },

    order_id: {
      type: "uuid",
      references: "orders",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("applications_orders");
  pgm.dropTable("orders_payments");
  pgm.dropTable("orders");
};
