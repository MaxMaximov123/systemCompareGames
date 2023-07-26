exports.up = function(knex) {
    return knex.schema.table('pairs', function(table) {
      table.index('id');
      table.index('id1');
      table.index('id2');
      table.index('similarityNames');
      table.index('similarityOutcomes');
      table.index('similarityScores');
      table.index('totalSimilarity');
      table.index('needGroup');
      table.index('grouped');
    });
    };
    
  exports.down = function(knex) {
    return knex.schema.table('pairs', function(table) {
      table.dropIndex('id');
      table.dropIndex('id1');
      table.dropIndex('id2');
      table.dropIndex('similarityNames');
      table.dropIndex('similarityOutcomes');
      table.dropIndex('similarityScores');
      table.dropIndex('totalSimilarity');
      table.dropIndex('needGroup');
      table.dropIndex('grouped');
    });
  };