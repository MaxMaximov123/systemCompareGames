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
        const game1Ids = await db('games').select('id').where('sportKey', sportKey) // получение списка id1

        if (game1Ids){
            for (let game1Id of game1Ids){
                const timeFrame1 = (await db('outcomes').min('now as startTime').max('now as finTime').where('id', game1Id.id))[0];
                if (timeFrame1.startTime == null || timeFrame1.finTime == null || (new Date().getTime() - timeFrame1.startTime) / 3600000 > TIMELIVEGAME){
                    db('games').where('id', game1Id.id).del();
                    db('outcomes').where('id', game1Id.id).del();
                    db('scores').where('id', game1Id.id).del();
                    console.log('DELETE game1', game1Id.id);
                    console.log(timeFrame1, (new Date().getTime() - timeFrame1.startTime) / 3600000);
                    continue;
                }
                if ((timeFrame1.finTime - timeFrame1.startTime) / 60000 >= TIMEDELTA){    
                    const game2Ids = await db('games').select('id').where('sportKey', sportKey).whereNot('id', game1Id.id) // получение списка id2
                    for (let game2Id of game2Ids){
                        const timeFrame2 = (await db('outcomes').min('now as startTime').max('now as finTime').where('id', game2Id.id))[0];
                        if (timeFrame2.startTime == null || timeFrame2.finTime == null || (new Date().getTime() - timeFrame2.startTime) / 3600000 > TIMELIVEGAME){
                            db('games').where('id', game2Id.id).del();
                            db('outcomes').where('id', game2Id.id).del();
                            db('scores').where('id', game2Id.id).del();
                            console.log('DELETE game2', game2Id.id);
                            console.log(timeFrame2, (new Date().getTime() - timeFrame2.startTime) / 3600000);   
                            continue;
                        }
                    }
                }
            }
        }
        else {
            console.log('error');
        }
    }
}


async function main(){
    const sportKeys = ['SOCCER', 'HOCKEY', 'TENNIS', 'BASEBALL', 'CRICKET', 'BASKETBALL', 'VOLLEYBALL', 'HANDBALL', 'FUTSAL', 'TABLE_TENNIS', 'WATER_POLO', 'CYBERSPORT', 'SNOOKER', 'AMERICAN_FOOTBALL'];
    for (sportKey of sportKeys){
        console.log('START', sportKey);
        start(sportKey);
    }
}

if (require.main === module) {
    main();
}