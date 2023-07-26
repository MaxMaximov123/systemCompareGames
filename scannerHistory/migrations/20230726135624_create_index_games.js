exports.up = function(knex) {
    return knex.schema.table('pairs', function(table) {
      table.index('id');
      table.index('sportKey');
      table.index('bookieKey');
      table.index('startTime');
    });
    };
    
  exports.down = function(knex) {
    return knex.schema.table('pairs', function(table) {
      table.dropIndex('id');
      table.dropIndex('sportKey');
      table.dropIndex('bookieKey');
      table.dropIndex('startTime');
    });
  };