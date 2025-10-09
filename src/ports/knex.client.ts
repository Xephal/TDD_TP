import knex, { Knex } from "knex"

const env = process.env.NODE_ENV || "development"

const getConnectionString = () => {
	if (env === "test") {
		return (
			process.env.TEST_DATABASE_URL ||
			// fallback only for local runs without Testcontainers
			"postgres://postgres:postgres@localhost:5432/ride_app_test"
		)
	}
	return (
		process.env.DATABASE_URL ||
		// default local dev
		"postgres://postgres:postgres@localhost:5432/ride_app_dev"
	)
}

const knexConfig: Knex.Config = {
	client: "pg",
	connection: getConnectionString(),
	migrations: { directory: "./migrations" },
}

export const db: Knex = knex(knexConfig)

export default db
