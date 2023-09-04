require("dotenv").config();

function getDatabaseName() {
  const mainName = `cuja_${process.env.VERCEL_ENV}`;
  const isPreviewEnv = process.env.VERCEL_ENV === "preview";
  const database = isPreviewEnv
    ? `${mainName}_${process.env.VERCEL_GIT_PULL_REQUEST_ID}`
    : mainName;
  return database;
}

module.exports = {
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: getDatabaseName(),
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  dialect: "mysql",
};
