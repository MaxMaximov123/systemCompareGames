exports.up = function (knex) {
  return knex.schema.table("games", function (table) {
    table.bigInteger("liveFrom");
    table.bigInteger("liveTill");
  });
};

exports.down = function (knex) {
  return knex.schema.table("games", function (table) {
    table.dropColumn("liveFrom");
    table.dropColumn("liveTill");
  });
};
