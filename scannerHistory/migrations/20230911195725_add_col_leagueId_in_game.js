exports.up = function (knex) {
  return knex.schema.table("games", function (table) {
    table.bigint("leagueId");
    table.index('leagueId');
  });
};

exports.down = function (knex) {
  return knex.schema.table("games", function (table) {
    table.dropColumn("leagueId");
    table.dropIndex('leagueId');
  });
};
