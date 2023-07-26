exports.up = function(knex) {
    return knex.schema.table('outcomes', function(table) {
      table.index('path');
    });
    };
    
  exports.down = function(knex) {
    return knex.schema.table('outcomes', function(table) {
      table.dropIndex('path');
    });
  };