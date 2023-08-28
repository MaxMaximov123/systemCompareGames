exports.up = function(knex) {
    return knex.schema.createTable('pairsNames', function(table) {
      table.increments('id').primary();
      table.string('originalWord');
      table.string('transltionWord');
      table.timestamp('createdAt');

      table.index('id');
      table.index('originalWord');
      table.index('transltionWord');
      table.index('createdAt');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('pairsNames');
};