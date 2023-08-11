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
    const stTime = new Date().getTime();
    const requestData = req.body;

    var groupedNewSystem = [];
    var groupedOldSystem = [];
    if (requestData.filters.groupedNewSystem === 'Все') groupedNewSystem = [true, false];
    if (requestData.filters.groupedNewSystem === 'Да') groupedNewSystem = [true,];
    if (requestData.filters.groupedNewSystem === 'Нет') groupedNewSystem = [false,];

    if (requestData.filters.groupedOldSystem === 'Все') groupedOldSystem = [true, false];
    if (requestData.filters.groupedOldSystem === 'Да') groupedOldSystem = [true,];
    if (requestData.filters.groupedOldSystem === 'Нет') groupedOldSystem = [false,];
    
    try{
      var pairs = {};
      const result = {};
      pairs = await db('pairs')
      .join('games as games1', 'pairs.id1', 'games1.id')
      .join('games as games2', 'pairs.id2', 'games2.id')
      .offset((requestData.page - 1) * 10).limit(10)
      .select(
        db.raw('(SELECT id FROM outcomes WHERE outcomes.id = pairs.id1 LIMIT 1) as hasHistory1', []),
        db.raw('(SELECT id FROM outcomes WHERE outcomes.id = pairs.id2 LIMIT 1) as hasHistory2', []),
        'pairs.id as id',
        'pairs.now as now',
        'pairs.isLive as isLive',
        'pairs.game1Team1Name as game1Team1Name',
        'pairs.game2Team1Name as game2Team1Name',
        'pairs.game1Team2Name as game1Team2Name',
        'pairs.game2Team2Name as game2Team2Name',
        'pairs.similarityNames as similarityNames',
        'pairs.similarityOutcomesPre as similarityOutcomes',
        'pairs.similarityScores as similarityScores',
        'pairs.totalSimilarity as totalSimilarity',
        'pairs.needGroup as needGroup',
        'pairs.grouped as grouped',
        'games1.lastUpdate as lastUpdate1',
        'games2.lastUpdate as lastUpdate2',
        'games1.bookieKey as bookieKey1',
        'games1.liveFrom as liveFrom1',
        'games2.liveFrom as liveFrom2',
        'games1.liveTill as liveTill1',
        'games2.liveTill as liveTill2',
        'games1.startTime as startTime1',
        'games1.sportKey as sportKey',
        'games2.bookieKey as bookieKey2',
        'games2.startTime as startTime2',)
        .orderBy('pairs.id', 'asc')
        .where('similarityNames', '>=', requestData.filters.simNames.min)
        .where('similarityNames', '<=', requestData.filters.simNames.max)
        .where('similarityOutcomes', '>=', requestData.filters.simOutcomes.min)
        .where('similarityOutcomes', '<=', requestData.filters.simOutcomes.max)
        .where('similarityScores', '>=', requestData.filters.simScores.min)
        .where('similarityScores', '<=', requestData.filters.simScores.max)
        .whereIn('needGroup', groupedNewSystem)
        .whereIn('grouped', groupedOldSystem)
      result.pairs = pairs;
      result.pageCount = await db('pairs')
      .where('similarityNames', '>=', requestData.filters.simNames.min)
      .where('similarityNames', '<=', requestData.filters.simNames.max)
      .where('similarityOutcomes', '>=', requestData.filters.simOutcomes.min)
      .where('similarityOutcomes', '<=', requestData.filters.simOutcomes.max)
      .where('similarityScores', '>=', requestData.filters.simScores.min)
      .where('similarityScores', '<=', requestData.filters.simScores.max)
      .whereIn('needGroup', groupedNewSystem)
      .whereIn('grouped', groupedOldSystem)
      .count('id');
      result.time = (new Date().getTime() - stTime) / 1000;
      res.send(JSON.stringify(result));
    } catch(e){
      console.log(e);
      res.send(JSON.stringify({}));
    }
  });

app.post('/api/paths', async (req, res) => {
  const stTime = new Date().getTime();
  const requestData = req.body;
  console.log(requestData);
  
  try{
    var pathsList1 = [];
    var pathsList2 = [];
    var pathsList = [];
    if (requestData.type === 'outcomes'){
      pathsList1 = await db('pairs')
      .join('outcomes as outcomes1', 'pairs.id1', 'outcomes1.id')
      .where('pairs.id', requestData.id)
      .distinct('outcomes1.path as path1');

      pathsList2 = await db('pairs')
      .join('outcomes as outcomes2', 'pairs.id2', 'outcomes2.id')
      .where('pairs.id', requestData.id)
      .distinct('outcomes2.path as path2');

      pathsList1 = pathsList1.map(obj => obj.path1);
      pathsList2 = pathsList2.map(obj => obj.path2);

      for (let path of pathsList1){
        if (pathsList2.includes(path)) pathsList.push(path);
      }

    } else if (requestData.type === 'scores'){
      pathsList1 = await db('pairs')
      .join('scores as scores1', 'pairs.id1', 'scores1.id')
      .where('pairs.id', requestData.id)
      .distinct('scores1.path as path1');

      pathsList2 = await db('pairs')
      .join('scores as scores2', 'pairs.id2', 'scores2.id')
      .where('pairs.id', requestData.id)
      .distinct('scores2.path as path2');

      pathsList1 = pathsList1.map(obj => obj.path1);
      pathsList2 = pathsList2.map(obj => obj.path2);

      for (let path of pathsList1){
        if (pathsList2.includes(path)) pathsList.push(path);
      }
    }
    const result = {time: (new Date().getTime()) - stTime, data: pathsList};
    res.send(JSON.stringify(result));
  } catch(e){
    console.log(e);
    res.send(JSON.stringify({time: (new Date().getTime()) - stTime, data: []}));
  }
});


app.post('/api/graphic', async (req, res) => {
  const stTime = new Date().getTime();
  const requestData = req.body;

  console.log(requestData);
  
  try{
    const result = {};
    if (requestData.type){
      result.game1 = await db('pairs')
      .join('scores', 'pairs.id1', 'scores.id')
      .join('games', 'pairs.id1', 'games.id')
      .select(
        'games.bookieKey as bookieKey',
        'scores.path as path',
        'scores.score as score',
        'scores.now as now',)
      .where('pairs.id', requestData.id)
      .where('scores.path', requestData.path)
      .orderBy('scores.now', 'asc');
      
      result.game2 = await db('pairs')
      .join('scores', 'pairs.id2', 'scores.id')
      .join('games', 'pairs.id2', 'games.id')
      .select(
        'games.bookieKey as bookieKey',
        'scores.path as path',
        'scores.score as score',
        'scores.now as now')
      .where('pairs.id', requestData.id)
      .where('scores.path', requestData.path)
      .orderBy('scores.now', 'asc');

    } else {
      result.game1 = await db('pairs')
      .join('outcomes', 'pairs.id1', 'outcomes.id')
      .join('games', 'pairs.id1', 'games.id')
      .select(
        'games.bookieKey as bookieKey',
        'outcomes.path as path',
        'outcomes.odds as odds',
        'outcomes.now as now')
      .where('pairs.id', requestData.id)
      .where('outcomes.path', requestData.path)
      .orderBy('outcomes.now', 'asc');
      
      result.game2 = await db('pairs')
      .join('outcomes', 'pairs.id2', 'outcomes.id')
      .join('games', 'pairs.id2', 'games.id')
      .select(
        'games.bookieKey as bookieKey',
        'outcomes.path as path',
        'outcomes.odds as odds',
        'outcomes.now as now')
      .where('pairs.id', requestData.id)
      .where('outcomes.path', requestData.path)
      .orderBy('outcomes.now', 'asc');
    }
    res.send(JSON.stringify({data: result, time: (new Date().getTime()) - stTime}));
  } catch(e){
    console.log(e);
    res.send(JSON.stringify({data: [], time: (new Date().getTime()) - stTime}));
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
