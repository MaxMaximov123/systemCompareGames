exports.up = function (knex) {
  return knex.schema.table("games", function (table) {
    table.dropIndex('id');
    table.renameColumn('id', 'gameId');
    table.increments('id').primary();
    table.index('id');
    table.index('gameId');
  });
};

exports.down = function (knex) {
  return knex.schema.table("games", function (table) {
    table.dropColumn('id');
    table.renameColumn('gameId', 'id');
  });
};
