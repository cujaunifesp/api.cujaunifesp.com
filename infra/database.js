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

const pool = new Pool(configurations);

async function query(queryObject) {
  const client = await pool.connect();
  try {
    return await client.query(queryObject);
  } finally {
    client.release();
  }
}

async function downAllMigrations() {
  const client = await pool.connect();
  try {
    return await migrationRunner({
      dir: "./infra/migrations",
      direction: "down",
      dbClient: client,
      migrationsTable: "pgmigrations",
      log: (log) => {},
    });
  } finally {
    client.release();
  }
}

async function runAllMigrations() {
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
  }
}

export default Object.freeze({
  query,
  runAllMigrations,
  downAllMigrations,
});
