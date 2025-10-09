import knex, { Knex } from "knex"

const config: any = require("../../knexfile")

const env = process.env.NODE_ENV || "development"
const knexConfig: Knex.Config = (config as Record<string, Knex.Config>)[env] || config.development

export const db: Knex = knex(knexConfig)

export default db
