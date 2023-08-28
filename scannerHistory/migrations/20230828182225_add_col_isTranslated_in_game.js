exports.up = function (knex) {
  return knex.schema.table("games", function (table) {
    table.timestamp("translatedAt");
    table.index('translatedAt');
  });
};

exports.down = function (knex) {
  return knex.schema.table("games", function (table) {
    table.dropColumn("translatedAt");
    table.dropIndex('translatedAt');
  });
};
