exports.up = function(knex) {
    return knex.schema.table('outcomes', function(table) {
      table.index('path');
      table.index('id');
      table.index('now');
    });
    };
    
  exports.down = function(knex) {
    return knex.schema.table('outcomes', function(table) {
      table.dropIndex('path');
      table.dropIndex('id');
      table.dropIndex('now');
    });
  };