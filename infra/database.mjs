import { createRequire } from "module";

const require = createRequire(import.meta.url);
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
);

async function query(queryString, options) {
  await sequelize.query(queryString, options);
}

export default Object.freeze({
  query,
});
