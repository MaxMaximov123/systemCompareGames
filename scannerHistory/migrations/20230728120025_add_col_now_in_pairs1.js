exports.up = function (knex) {
  return knex.schema.table("pairs", function (table) {
    table.bigInteger("now");
  });
};

exports.down = function (knex) {
  return knex.schema.table("pairs", function (table) {
    table.dropColumn("now");
  });
};
