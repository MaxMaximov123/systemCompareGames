exports.up = function(knex) {
    return knex.schema.table('outcomes', function(table) {
      table.index('isLive');
    });
    };
    
  exports.down = function(knex) {
    return knex.schema.table('outcomes', function(table) {
      table.dropIndex('isLive');
    });
  };