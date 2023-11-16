import database from "infra/database";

const isServerlessRuntime = !!process.env.NEXT_PUBLIC_VERCEL_ENV;
const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

const host = isProduction
  ? `https://${process.env.NEXT_PUBLIC_WEBSERVER_HOST}`
  : isServerlessRuntime
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : `http://${process.env.NEXT_PUBLIC_WEBSERVER_HOST}:${process.env.NEXT_PUBLIC_WEBSERVER_PORT}`;

async function refreshDatabase() {
  await database.dropAllTables();
  await database.runAllMigrations();
}

async function runPendingMigrations() {
  await database.runAllMigrations();
}

export default Object.freeze({
  host,
  refreshDatabase,
  runPendingMigrations,
});
