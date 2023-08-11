exports.up = function (knex) {
  return knex.schema.table("pairs", function (table) {
    table.renameColumn('similarityOutcomes', 'similarityOutcomesPre');
    table.float('similarityOutcomesLive');
  });
};

exports.down = function (knex) {
  return knex.schema.table("pairs", function (table) {
    table.renameColumn('similarityOutcomesPre', 'similarityOutcomes');
    table.dropColumn('similarityOutcomesLive');
  });
};
