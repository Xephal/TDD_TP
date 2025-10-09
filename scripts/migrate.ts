import knex from "knex";
import path from "path";

async function main() {
  const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ride_app_dev";
  const db = knex({
    client: "pg",
    connection: url,
    migrations: { directory: path.resolve(process.cwd(), "migrations") },
  });

  try {
    await db.migrate.latest();
    console.log("Migrations applied successfully");
  } finally {
    await db.destroy();
  }
}

main().catch((e) => {
  console.error("Migration failed", e);
  process.exit(1);
});
