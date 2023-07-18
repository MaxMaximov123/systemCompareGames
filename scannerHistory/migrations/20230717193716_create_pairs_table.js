exports.up = function(knex) {
    return knex.schema.createTable('pairs', function(table) {
      table.increments('id').primary();
      table.bigint('id1');
      table.bigint('id2');
      table.boolean('isLive');
      table.string('game1Team1Name');
      table.string('game2Team1Name');
      table.string('game1Team2Name');
      table.string('game2Team2Name');
      table.float('similarityNames');
      table.float('similarityOutcomes');
      table.float('similarityScores');
      table.float('totalSimilarity');
      table.boolean('needGroup');
      table.boolean('grouped');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('pairs');
};