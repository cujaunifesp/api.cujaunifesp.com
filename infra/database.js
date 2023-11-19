import migrationRunner from "node-pg-migrate";
import { Pool } from "pg";

const configurations = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
};

if (!process.env.VERCEL_ENV) {
  delete configurations.ssl;
}

async function query(queryObject) {
  const pool = new Pool(configurations);
  const client = await pool.connect();
  try {
    return await client.query(queryObject);
  } finally {
    client.release();
    pool.end();
  }
}

async function runAllMigrations() {
  const pool = new Pool(configurations);
  const client = await pool.connect();
  try {
    return await migrationRunner({
      dir: "./infra/migrations",
      direction: "up",
      dbClient: client,
      migrationsTable: "pgmigrations",
      log: (log) => {},
    });
  } finally {
    client.release();
    pool.end();
  }
}

async function dropAllTables() {
  await query("drop schema public cascade; create schema public;");
}

export default Object.freeze({
  query,
  runAllMigrations,
  dropAllTables,
});
