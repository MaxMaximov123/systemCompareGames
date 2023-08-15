exports.up = function(knex) {
    return knex.schema.createTable('decisions', function(table) {
      table.increments('id').primary();
      table.bigint('pairId');
      table.float('similarityNames');
      table.float('similarityOutcomesPre');
      table.float('similarityOutcomesLive');
      table.float('similarityScores');
      table.float('timeDiscrepancy');
      table.boolean('needGroup');
      table.timestamp('createdAt');
      table.boolean('grouped');

      table.index('id');
      table.index('similarityNames');
      table.index('similarityOutcomesPre');
      table.index('similarityOutcomesLive');
      table.index('similarityScores');
      table.index('timeDiscrepancy');
      table.index('needGroup');
      table.index('grouped');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('decisions');
};