exports.up = function(knex) {
    return knex.schema.createTable('translations', function(table) {
      table.increments('id').primary();
      table.string('originalWord').primary();
      table.string('translationWord');
      table.timestamp('createdAt');

      table.index('id');
      table.index('originalWord');
      table.index('translationWord');
      table.index('createdAt');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('translations');
};