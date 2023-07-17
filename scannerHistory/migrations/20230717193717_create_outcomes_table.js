exports.up = function(knex) {
    return knex.schema.createTable('outcomes', function(table) {
      table.bigint('id').primary();
      table.string('path');
      table.float('odds');
      table.bigint('now');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('outcomes');
  };
  