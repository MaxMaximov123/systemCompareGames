import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const isLiveValOnType = {
  outcomesPre: false,
  outcomesLive: true,
};

import { db } from './database.js';

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

    const sportKeys = [
      "SOCCER",
      "TABLE_TENNIS",
      "TENNIS",
      "BASKETBALL",
      "CYBERSPORT",
      "HOCKEY",
      "BASEBALL",
      "VOLLEYBALL",
      "HANDBALL",
      "CRICKET",
      "FUTSAL",
      "SNOOKER",
      "AMERICAN_FOOTBALL",
      "WATER_POLO",
    ];
    var groupedNewSystem = [];
    var groupedOldSystem = [];
    var sportKey = [];

    if (requestData.filters.groupedNewSystem === 'Все') groupedNewSystem = [true, false];
    if (requestData.filters.groupedNewSystem === 'Да') groupedNewSystem = [true,];
    if (requestData.filters.groupedNewSystem === 'Нет') groupedNewSystem = [false,];

    if (requestData.filters.groupedOldSystem === 'Все') groupedOldSystem = [true, false];
    if (requestData.filters.groupedOldSystem === 'Да') groupedOldSystem = [true,];
    if (requestData.filters.groupedOldSystem === 'Нет') groupedOldSystem = [false,];

    if (requestData.filters.sportKey === 'Все') sportKey = sportKeys;
    else sportKey = [requestData.filters.sportKey,];
    
    try{
      var pairs = {};
      const result = {};

      pairs = await db('pairs')
      .where('similarityNames', '>=', requestData.filters.simNames.min)
      .where('similarityNames', '<=', requestData.filters.simNames.max)
      .where('timeDiscrepancy', '>=', requestData.filters.timeDiscrepancy.min)
      .where('timeDiscrepancy', '<=', requestData.filters.timeDiscrepancy.max)
      .where('similarityOutcomesPre', '>=', requestData.filters.simOutcomesPre.min)
      .where('similarityOutcomesPre', '<=', requestData.filters.simOutcomesPre.max)
      .where('similarityOutcomesLive', '>=', requestData.filters.simOutcomesLive.min)
      .where('similarityOutcomesLive', '<=', requestData.filters.simOutcomesLive.max)
      .where('similarityScores', '>=', requestData.filters.simScores.min)
      .where('similarityScores', '<=', requestData.filters.simScores.max)
      .whereIn('needGroup', groupedNewSystem)
      .whereIn('grouped', groupedOldSystem)
      .whereIn('sportKey', sportKey)
      .where(function() {
        this.where('game1Team1Name', 'ilike', `%${requestData.filters.teamName}%`)
          .orWhere('game1Team2Name', 'ilike', `%${requestData.filters.teamName}%`)
          .orWhere('game2Team1Name', 'ilike', `%${requestData.filters.teamName}%`)
          .orWhere('game2Team2Name', 'ilike', `%${requestData.filters.teamName}%`)
      })
      .orderBy('id', 'asc')
      .offset((requestData.page - 1) * 10).limit(10)
      .select('*', db.raw('(SELECT COUNT(id) FROM decisions WHERE pair_key = pairs.key) AS count_decisions'));
      
      result.pairs = pairs;
      result.pageCount = await db('pairs')
      // .join('games as games1', 'pairs.id1', 'games1.id')
      .where('similarityNames', '>=', requestData.filters.simNames.min)
      .where('similarityNames', '<=', requestData.filters.simNames.max)
      .where('timeDiscrepancy', '>=', requestData.filters.timeDiscrepancy.min)
      .where('timeDiscrepancy', '<=', requestData.filters.timeDiscrepancy.max)
      .where('similarityOutcomesPre', '>=', requestData.filters.simOutcomesPre.min)
      .where('similarityOutcomesPre', '<=', requestData.filters.simOutcomesPre.max)
      .where('similarityOutcomesLive', '>=', requestData.filters.simOutcomesLive.min)
      .where('similarityOutcomesLive', '<=', requestData.filters.simOutcomesLive.max)
      .where('similarityScores', '>=', requestData.filters.simScores.min)
      .where('similarityScores', '<=', requestData.filters.simScores.max)
      .whereIn('needGroup', groupedNewSystem)
      .whereIn('grouped', groupedOldSystem)
      .whereIn('sportKey', sportKey)
      .where(function() {
        this.where('game1Team1Name', 'ilike', `%${requestData.filters.teamName}%`)
          .orWhere('game1Team2Name', 'ilike', `%${requestData.filters.teamName}%`)
          .orWhere('game2Team1Name', 'ilike', `%${requestData.filters.teamName}%`)
          .orWhere('game2Team2Name', 'ilike', `%${requestData.filters.teamName}%`)
      })
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
    if (requestData.type === 'outcomesPre' || requestData.type === 'outcomesLive'){
      pathsList1 = await db('pairs')
      .leftJoin('outcomes', 'pairs.id1', 'outcomes.id')
      .where('pairs.id', requestData.id)
      .where('outcomes.isLive', isLiveValOnType[requestData.type])
      .distinct('outcomes.path as path1');
    

      pathsList2 = await db('pairs')
      .leftJoin('outcomes', 'pairs.id2', 'outcomes.id')
      .where('pairs.id', requestData.id)
      .where('outcomes.isLive', isLiveValOnType[requestData.type])
      .distinct('outcomes.path as path2');

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

app.post('/api/gameIds', async (req, res) => {
  const stTime = new Date().getTime();
  const requestData = req.body;
  console.log(requestData);
  res.send(JSON.stringify({
    time: (new Date().getTime()) - stTime, 
    data: await db('pairs').where('id', requestData.id).select('game1Id as game1', 'game2Id as game2')
  }));
});


app.post('/api/decisions', async (req, res) => {
  const stTime = new Date().getTime();
  const requestData = req.body;
  
  try{
    const result = {
      data: await db('decisions').select('*').where('pairKey', requestData.pairKey).orderBy('updated_at', 'asc'),
      time: (new Date().getTime()) - stTime,};
    res.send(JSON.stringify(result));
  } catch(e){
    console.log(e);
    res.send(JSON.stringify({time: (new Date().getTime()) - stTime, data: []}));
  }
});

app.post('/api/teamNames', async (req, res) => {
  const stTime = new Date().getTime();
  const requestData = req.body;
  
  try{
    const result = {
      data: await db('teamsNamesUpdates').select('*').where('gameId', requestData.gameId).orderBy('id', 'asc'),
      time: (new Date().getTime()) - stTime,};
    res.send(JSON.stringify(result));
  } catch(e){
    console.log(e);
    res.send(JSON.stringify({time: (new Date().getTime()) - stTime, data: []}));
  }
});

app.post('/api/startTime', async (req, res) => {
  const stTime = new Date().getTime();
  const requestData = req.body;
  console.log(requestData);
  
  try{
    const result = {
      data: await db('startTimeUpdates').select('*').where('gameId', requestData.gameId).orderBy('id', 'asc'),
      time: (new Date().getTime()) - stTime,
    };
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
    if (requestData.type === 'scores'){
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

    } else if (requestData.type === 'outcomesPre' || requestData.type === 'outcomesLive') {
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
      .where('outcomes.isLive', isLiveValOnType[requestData.type])
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
      .where('outcomes.isLive', isLiveValOnType[requestData.type])
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