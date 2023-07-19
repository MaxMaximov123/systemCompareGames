const express = require('express');
const path = require('path');

const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Замените * на адрес вашего сайта, если нужно ограничить доступ
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const staticFilesPath = path.join(__dirname, 'dist');

console.log(__dirname, staticFilesPath)

app.use(express.static(staticFilesPath));

app.post('/api/pairs', async (req, res) => {
    const requestData = req.body;
    
    try{
      var pairs = {};
      const result = {};
      if (requestData.oneGrouped === true){
        pairs = await db('pairs').where('needGroup', true).orWhere('grouped', true).select('*').orderBy('id', 'asc');
        pairs = pairs.slice((requestData.page - 1) * 10, requestData.page * 10);
        
      } else {
        pairs = await db('pairs').offset((requestData.page - 1) * 10).limit(10).select('*').orderBy('id', 'asc').whereNot('needGroup', null);
      }
      result.pairs = pairs;
      result.pageCount = await db('pairs').whereNot('needGroup', null).count('id');
      res.send(JSON.stringify(result));
    } catch(e){
      console.log(e);
      res.send(JSON.stringify({}));
    }
  });



app.get('*', (req, res) => {
    res.sendFile(path.join(staticFilesPath, 'index.html'));
});

// Запустите сервер на указанном порту
const port = 8005;
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
