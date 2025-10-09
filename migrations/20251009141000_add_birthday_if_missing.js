/**
 * Ensure riders.birthday exists (safe migration)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const has = await knex.schema.hasColumn("riders", "birthday")
  if (!has) {
    await knex.schema.alterTable("riders", (t) => {
      t.date("birthday").nullable()
    })
  }
}

exports.down = async function (knex) {
  const has = await knex.schema.hasColumn("riders", "birthday")
  if (has) {
    await knex.schema.alterTable("riders", (t) => {
      t.dropColumn("birthday")
    })
  }
}
