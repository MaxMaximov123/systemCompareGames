exports.up = function(knex) {
    return knex.schema.createTable('startTimeUpdates', function(table) {
      table.increments('id').primary();
      table.bigint('gameId');
      table.timestamp('startTime');
      table.timestamp('time');

      table.index('id');
      table.index('gameId');
      table.index('startTime');
      table.index('time');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('startTimeUpdates');
};