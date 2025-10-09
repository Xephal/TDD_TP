/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable("riders", (t) => {
		// ajouter la date de naissance si elle n'existe pas
		t.date("birthday").nullable()
	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable("riders", (t) => {
		t.dropColumn("birthday")
	})
};
