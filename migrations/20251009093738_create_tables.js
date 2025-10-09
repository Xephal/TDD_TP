/**
 * Exemple minimal : riders, drivers, bookings
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("riders", (t) => {
      t.string("id").primary()
      t.decimal("balance", 10, 2).notNullable().defaultTo(0)
      t.timestamps(true, true)
    })
    .createTable("drivers", (t) => {
      t.string("id").primary()
      t.string("name")
      t.timestamps(true, true)
    })
    .createTable("bookings", (t) => {
      t.string("id").primary()
      t.string("rider_id").notNullable().references("id").inTable("riders").onDelete("CASCADE")
      t.string("driver_id").nullable().references("id").inTable("drivers").onDelete("SET NULL")
      t.string("from").notNullable()
      t.string("to").notNullable()
      t.string("status").notNullable()
      t.decimal("amount", 10, 2).notNullable()
      t.integer("distance_km")
      t.timestamps(true, true)
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("bookings")
    .dropTableIfExists("drivers")
    .dropTableIfExists("riders")
}