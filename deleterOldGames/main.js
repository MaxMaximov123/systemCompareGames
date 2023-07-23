const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);


function copy(obj){
    return JSON.parse(JSON.stringify(obj));
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


async function start(sportKey) {
    require('dotenv').config();


    //_______________________________________//

    const TIMEDELTA = 10 // минимальное время игры для ее сравнения (мин)
    const TIMELIVEGAME = 24 // время (в часах) через которое игра удаляется

    //_______________________________________//



    while (true){
        // const game1Ids = await db('games').select('id', 'bookieKey', 'isLive').where('sportKey', sportKey).orderBy('startTime', 'asc') // получение списка id1
        const game1Ids = await db('games')
        .join('outcomes', 'outcomes.id', 'games.id')
        .join('pairs', function () {
            this.on('games.id', '=', 'pairs.id1')
              .orOn('games.id', '=', 'pairs.id2');
          })
        //   .whereNull('pairs.id1')
        //   .whereNull('pairs.id2')
          .where('pairs.needGroup', false)
          .where('pairs.grouped', false)
          .where('games.sportKey', sportKey)
        //   .orderBy('games.startTime', 'asc')
          .select('games.id as id')
          .groupBy('games.id')
          .havingRaw('(? - MIN(outcomes.now)) / 3600000  > ?', [new Date().getTime(), TIMELIVEGAME]);
        
        console.log(game1Ids);
        await db('outcomes').whereIn('id', game1Ids.map(obj => obj.id)).del();
        await db('scores').whereIn('id', game1Ids.map(obj => obj.id)).del();
        console.log('DELETE', sportKey, game1Ids.length);
        await delay(60000 * 10);
    }
}


async function main(){
    // const sportKeys = ['SOCCER', 'HOCKEY', 'TENNIS', 'BASEBALL', 'CRICKET', 'BASKETBALL', 'VOLLEYBALL', 'HANDBALL', 'FUTSAL', 'TABLE_TENNIS', 'WATER_POLO', 'CYBERSPORT', 'SNOOKER', 'AMERICAN_FOOTBALL'];
    const sportKeys = process.env.SPORTKEYS.split(';')
    for (sportKey of sportKeys){
        console.log('START', sportKey);
        start(sportKey);
    }
}

if (require.main === module) {
    main();
}