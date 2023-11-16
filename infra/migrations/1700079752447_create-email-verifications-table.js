/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("email_verifications", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    email: {
      type: "varchar(254)",
      notNull: true,
    },

    attempts: {
      type: "integer",
      default: 0,
      notNull: true,
    },

    verification_code: {
      type: "char(6)",
      notNull: true,
    },

    expires_at: {
      type: "timestamp with time zone",
      notNull: true,
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("email_verifications");
};
