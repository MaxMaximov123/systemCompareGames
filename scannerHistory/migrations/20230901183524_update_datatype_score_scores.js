exports.up = function(knex) {
    return knex.schema.alterTable('scores', function(table) {
      table.float('score').alter();
    });
    };
    
  exports.down = function(knex) {
    return knex.schema.alterTable('scores', function(table) {
      table.integer('score').alter();
    });
  };