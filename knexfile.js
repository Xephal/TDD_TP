module.exports = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ride_app_dev",
    migrations: { directory: "./migrations" },
  },
  test: {
    client: "pg",
    connection: process.env.TEST_DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ride_app_test",
    migrations: { directory: "./migrations" },
  },
}