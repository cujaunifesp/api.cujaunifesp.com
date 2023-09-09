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
  },
);

async function query(queryString, options) {
  try {
    await sequelize.query(queryString, options);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

export default Object.freeze({
  query,
});
