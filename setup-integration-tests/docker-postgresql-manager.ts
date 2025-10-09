import * as path from "path";
import knex, { Knex } from "knex";
import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";

export let dockerDBInstance: null = null; // kept for backward compatibility
export let pgContainer: StartedTestContainer | null = null;

export const startDockerPostgresql = async (): Promise<void> => {
  let sqlConnection: Knex | null = null;
  try {
    // Ensure the app uses the dockerized test DB
    process.env.NODE_ENV = process.env.NODE_ENV || "test";
    process.env.INTEGRATION = "1";

    console.log("Starting Postgres test container and running migrations...");
    pgContainer = await new GenericContainer("postgres:13.2")
      .withEnvironment({
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "postgres",
        POSTGRES_DB: "ride_app_test",
      })
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections"))
      .start();

    const host = pgContainer.getHost();
    const mappedPort = pgContainer.getMappedPort(5432);
    const user = "postgres";
    const password = "postgres";
    const database = "ride_app_test";
    process.env.TEST_DATABASE_URL = `postgres://${user}:${password}@${host}:${mappedPort}/${database}`;
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL; // fallback if code reads DATABASE_URL
    console.log(`Postgres started on ${host}:${mappedPort}`);
    console.log(`TEST_DATABASE_URL=${process.env.TEST_DATABASE_URL}`);

    // Wait for Postgres to be ready then run migrations from root ./migrations
    sqlConnection = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
      migrations: { directory: path.resolve(process.cwd(), "migrations") },
    });

    // Simple readiness probe with retries
    const maxRetries = 30;
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    for (let i = 0; i < maxRetries; i++) {
      try {
        await sqlConnection.raw("select 1");
        break;
      } catch (e) {
        if (i === maxRetries - 1) throw e;
        await delay(1000);
      }
    }
    await sqlConnection.migrate.latest();
    console.log("Migrations completed");
  } catch (e) {
    console.error("❌ Failed to start DB:", e);
    throw e;
  } finally {
    if (sqlConnection) {
      await sqlConnection.destroy();
    }
  }
};

// Utility to truncate domain tables if needed in the future
export async function resetDB(sqlConnection: Knex) {
  const tables = ["bookings", "drivers", "riders"]; // order is handled by CASCADE
  for (const table of tables) {
    await sqlConnection.raw(`TRUNCATE TABLE ${table} CASCADE`);
  }
}

export async function stopDockerPostgresql(): Promise<void> {
  if (pgContainer) {
    await pgContainer.stop();
    pgContainer = null;
  }
}
