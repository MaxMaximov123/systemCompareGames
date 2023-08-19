exports.up = function(knex) {
    return knex.schema.createTable('pairsNames', function(table) {
      table.increments('id').primary();
      table.bigint('team1Id');
      table.bigint('team2Id');
      table.string('team1Name');
      table.string('team2Name');
      table.string('сhangedTeam1Name');
      table.string('сhangedTeam2Name');
      table.float('similarity');
      table.timestamp('createdAt');

      table.index('id');
      table.index('team1Id');
      table.index('team2Id');
      table.index('team1Name');
      table.index('team2Name');
      table.index('сhangedTeam1Name');
      table.index('сhangedTeam2Name');
      table.index('similarity');
      table.index('createdAt');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('pairsNames');
};