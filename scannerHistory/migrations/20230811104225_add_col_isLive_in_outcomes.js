exports.up = function (knex) {
  return knex.schema.table("outcomes", function (table) {
    table.boolean("isLive");
  });
};

exports.down = function (knex) {
  return knex.schema.table("outcomes", function (table) {
    table.boolean("isLive");
  });
};
