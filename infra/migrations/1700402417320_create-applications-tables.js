/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("applications", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    name: {
      type: "varchar(255)",
      notNull: true,
    },

    social_name: {
      type: "varchar(255)",
    },

    cpf: {
      type: "varchar(14)",
      notNull: true,
    },

    identity_document: {
      type: "varchar(50)",
      notNull: true,
    },

    email: {
      type: "varchar(254)",
      notNull: true,
    },

    phone: {
      type: "varchar(50)",
      notNull: true,
    },

    address: {
      type: "varchar(255)",
      notNull: true,
    },

    zip_code: {
      type: "varchar(16)",
      notNull: true,
    },

    city: {
      type: "varchar(64)",
      notNull: true,
    },

    state: {
      type: "varchar(64)",
      notNull: true,
    },

    sabbatarian: {
      type: "boolean",
      notNull: true,
    },

    special_assistance: {
      type: "boolean",
      notNull: true,
    },

    special_assistance_justification: {
      type: "varchar(510)",
    },

    selection_id: {
      type: "uuid",
      references: "selections",
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      notNull: true,
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });

  pgm.createTable("applications_in_groups", {
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
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      notNull: true,
    },

    selection_group_id: {
      type: "uuid",
      references: "selections_applications_groups",
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      notNull: true,
    },

    approved: {
      type: "boolean",
      default: false,
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("applications_in_groups");
  pgm.dropTable("applications");
};
