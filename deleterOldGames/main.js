const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);


function copy(obj){
    return JSON.parse(JSON.stringify(obj));
}


async function start(sportKey) {
    require('dotenv').config();


    //_______________________________________//

    const TIMEDELTA = 10 // минимальное время игры для ее сравнения (мин)
    const TIMELIVEGAME = 24 // время (в часах) через которое игра удаляется

    //_______________________________________//



    while (true){
        // const game1Ids = await db('games').select('id', 'bookieKey', 'isLive').where('sportKey', sportKey).orderBy('startTime', 'asc') // получение списка id1
        const game1Ids = await db('games').leftJoin('pairs', function () {
            this.on('games.id', '=', 'pairs.id1')
              .orOn('games.id', '=', 'pairs.id2');
          })
        //   .whereNull('pairs.id1')
        //   .whereNull('pairs.id2')
          .where('pairs.needGroup', false)
          .where('pairs.grouped', false)
          .orderBy('games.startTime', 'asc')
          .select('games.id as id');
          
        console.log(game1Ids);
        if (game1Ids){
            for (let game1Id of game1Ids){
                const timeFrame1 = (await db('outcomes').min('now as startTime').max('now as finTime').where('id', game1Id.id))[0];
                if (timeFrame1.startTime == null || timeFrame1.finTime == null || (new Date().getTime() - timeFrame1.startTime) / 3600000 > TIMELIVEGAME){
                    await db('outcomes').where('id', game1Id.id).del();
                    await db('scores').where('id', game1Id.id).del();
                    console.log('DELETE game1', game1Id.id);
                    continue;
                }
            }
        }
        else {
            console.log('error');
        }
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