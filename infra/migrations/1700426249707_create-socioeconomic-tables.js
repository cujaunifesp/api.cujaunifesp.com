/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("socioeconomic_questions", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    text: {
      type: "varchar(510)",
      notNull: true,
    },

    number: {
      type: "integer",
      notNull: true,
      default: 0,
    },

    selection_id: {
      type: "uuid",
      references: "selections",
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
      notNull: true,
    },
  });

  pgm.createTable("socioeconomic_questions_options", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    label: {
      type: "varchar(255)",
      notNull: true,
    },

    type: {
      type: "varchar(32)",
      notNull: true,
    },

    number: {
      type: "integer",
      notNull: true,
      default: 0,
    },

    socioeconomic_question_id: {
      type: "uuid",
      references: "socioeconomic_questions",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      notNull: true,
    },
  });

  pgm.createTable("socioeconomic_answers", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
      unique: true,
    },

    value: {
      type: "varchar(255)",
      notNull: true,
    },

    socioeconomic_question_id: {
      type: "uuid",
      references: "socioeconomic_questions",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      notNull: true,
    },

    socioeconomic_question_option_id: {
      type: "uuid",
      references: "socioeconomic_questions_options",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      notNull: true,
    },

    application_id: {
      type: "uuid",
      references: "applications",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("socioeconomic_answers");
  pgm.dropTable("socioeconomic_questions_options");
  pgm.dropTable("socioeconomic_questions");
};
