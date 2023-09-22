import { createRequire } from "module";

const require = createRequire(import.meta.url);
require("dotenv").config();
const { Sequelize, QueryTypes } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    logging: false,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
);

const umzug = new Umzug({
  migrations: {
    glob: "infra/db/migrations/*.js",
    resolve: ({ name, path, context }) => {
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
});

async function query(queryString, options) {
  return await sequelize.query(queryString, options);
}

async function close() {
  await sequelize.close();
}

export default Object.freeze({
  query,
  close,
  queryTypes: QueryTypes,
  migrator: umzug,
});
