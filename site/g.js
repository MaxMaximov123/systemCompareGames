const express = require('express');
const app = express();
const port = 3000;


async function getDataSql(client, sqlQuery, values){
  try {
      return (await client.query(sqlQuery, values)).rows;
  } catch (error) {
      console.error('Error adding record:', error);
      return [];
  }
}


async function main(id1, id2, st){
  
  const { Pool } = require('pg');
  require('dotenv').config();
  const compare_games = require('..//similarGames/Nodejs/main');
  console.log(id1, id2);

  const pool = new Pool({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: 'localhost',
      database: process.env.POSTGRES_DB,
      port: 3200,
  });
  const client = await pool.connect();
  const game1Data = await getDataSql(client, `SELECT * FROM history WHERE id = ${id1}`, []);
  const game2Data = await getDataSql(client, `SELECT * FROM history WHERE id = ${id2}`, []);
  return new Promise((resolve, reject) => {
  compare_games(game1Data, game2Data).then(res => {
    console.log(game1Data)
    console.log(res)
    resolve(res)
  }).catch(err => {console.log('err')})
})

}


var users = {}

// Маршрут для отображения HTML страницы с графиком
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Маршрут для получения данных графика
app.get('/data', (req, res) => {
  // Здесь можно реализовать логику для получения данных графика
  // В данном примере просто возвращаем статические данные
  main(req.query.id1, req.query.id2, req.query.st).then((d) => {
    const data = d;
    res.json(data);
  });
  
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
