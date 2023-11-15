/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("selections", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    title: {
      type: "varchar(50)",
      notNull: true,
    },

    description: {
      type: "varchar(1000)",
      notNull: true,
    },

    exam_address: {
      type: "varchar(255)",
    },

    exam_date: {
      type: "timestamp with time zone",
      notNull: true,
    },

    applications_start_date: {
      type: "timestamp with time zone",
      notNull: true,
    },

    applications_end_date: {
      type: "timestamp with time zone",
      notNull: true,
    },

    public_notice_url: {
      type: "varchar(510)",
    },

    application_price: {
      type: "decimal(6,2)",
      notNull: true,
      default: 0,
    },

    application_limit: {
      type: "integer",
      notNull: true,
      default: 0,
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },

    published_at: {
      type: "timestamp with time zone",
    },

    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });

  pgm.createTable("selection_steps", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    title: {
      type: "varchar(255)",
      notNull: true,
    },

    date: {
      type: "timestamp with time zone",
      notNull: true,
    },

    selection_id: {
      type: "uuid",
      references: "selections",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("selection_steps");
  pgm.dropTable("selections");
};
