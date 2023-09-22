import database from "infra/db/database.mjs";

const isServerlessRuntime = !!process.env.NEXT_PUBLIC_VERCEL_ENV;
const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

const host = isProduction
  ? `https://${process.env.NEXT_PUBLIC_WEBSERVER_HOST}`
  : isServerlessRuntime
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : `http://${process.env.NEXT_PUBLIC_WEBSERVER_HOST}:${process.env.NEXT_PUBLIC_WEBSERVER_PORT}`;

async function refreshDatabase() {
  await database.migrator.down({ to: 0 });
  await database.migrator.up();
}

async function closeDatabaseConnections() {
  await database.close();
}

export default Object.freeze({
  host,
  refreshDatabase,
  closeDatabaseConnections,
});
