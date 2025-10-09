/**
 * Add useful indexes and constraints for bookings and riders
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return Promise.all([
    knex.schema.alterTable("bookings", (t) => {
      t.index("rider_id", "idx_bookings_rider_id")
      t.index("driver_id", "idx_bookings_driver_id")
      t.index("status", "idx_bookings_status")
      t.index("created_at", "idx_bookings_created_at")
    }),
    knex.schema.alterTable("riders", (t) => {
      t.index("balance", "idx_riders_balance")
    }),
    // Add check constraints to ensure non-negative amounts and balances
    knex.raw("ALTER TABLE bookings ADD CONSTRAINT bookings_amount_non_negative CHECK (amount >= 0)"),
    knex.raw("ALTER TABLE riders ADD CONSTRAINT riders_balance_non_negative CHECK (balance >= 0)"),
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema.alterTable("bookings", (t) => {
      t.dropIndex(["rider_id"], "idx_bookings_rider_id")
      t.dropIndex(["driver_id"], "idx_bookings_driver_id")
      t.dropIndex(["status"], "idx_bookings_status")
      t.dropIndex(["created_at"], "idx_bookings_created_at")
    }),
    knex.schema.alterTable("riders", (t) => {
      t.dropIndex(["balance"], "idx_riders_balance")
    }),
    knex.raw("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_amount_non_negative"),
    knex.raw("ALTER TABLE riders DROP CONSTRAINT IF EXISTS riders_balance_non_negative"),
  ])
}
