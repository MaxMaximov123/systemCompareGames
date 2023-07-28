exports.up = function (knex) {
  return knex.schema.table("pairs", function (table) {
    table.bigInteger("now").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.table("pairs", function (table) {
    table.dropColumn("now");
  });
};
