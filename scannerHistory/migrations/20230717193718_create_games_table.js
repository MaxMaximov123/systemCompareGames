exports.up = function(knex) {
    return knex.schema.createTable('games', function(table) {
      table.bigint('id').primary();
      table.bigint('globalGameId');
      table.boolean('isLive');
      table.string('team1Id');
      table.string('team2Id');
      table.string('team1Name');
      table.string('team2Name');
      table.string('sportKey');
      table.string('bookieKey');
      table.bigint('startTime');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('games');
};
  