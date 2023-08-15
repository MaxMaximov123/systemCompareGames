exports.up = function(knex) {
    return knex.schema.createTable('teamsNamesUpdates', function(table) {
      table.increments('id').primary();
      table.bigint('gameId');
      table.timestamp('team1Name');
      table.timestamp('team2Name');
      table.timestamp('time');

      table.index('id');
      table.index('gameId');
      table.index('team1Name');
      table.index('team2Name');
      table.index('time');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('teamsNamesUpdates');
};