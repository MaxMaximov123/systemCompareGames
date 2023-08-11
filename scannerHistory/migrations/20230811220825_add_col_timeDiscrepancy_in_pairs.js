exports.up = function (knex) {
  return knex.schema.table("pairs", function (table) {
    table.float('timeDiscrepancy');
  });
};

exports.down = function (knex) {
  return knex.schema.table("pairs", function (table) {
    table.dropColumn('timeDiscrepancy');
  });
};
