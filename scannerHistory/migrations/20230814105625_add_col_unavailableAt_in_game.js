exports.up = function (knex) {
  return knex.schema.table("games", function (table) {
    table.timestamp("unavailableAt");
  });
};

exports.down = function (knex) {
  return knex.schema.table("games", function (table) {
    table.dropColumn("unavailableAt");
  });
};
