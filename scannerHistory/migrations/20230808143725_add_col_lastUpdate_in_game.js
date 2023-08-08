exports.up = function (knex) {
  return knex.schema.table("games", function (table) {
    table.bigInteger("lastUpdate");
  });
};

exports.down = function (knex) {
  return knex.schema.table("games", function (table) {
    table.dropColumn("lastUpdate");
  });
};
