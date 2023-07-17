exports.up = function(knex) {
    return knex.schema.createTable('scores', function(table) {
      table.bigint('id').primary();
      table.integer('score');
      table.bigint('now');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('scores');
  };
  