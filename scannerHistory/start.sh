set -e

if knex migrate:latest; then
  echo "Миграции выполнены успешно"
else
  echo "Произошла ошибка при выполнении миграций"
fi
  echo "Миграции выполнены успешно"
  # node main.js