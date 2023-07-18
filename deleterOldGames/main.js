const knex = require('knex');
const config = require('../../scannerHistory/knexfile');

const db = knex(config.development);


/**
 * @param {Array} game1 - History of first game
 * @param {Array} game2 - History of second game: game[i] = Object
 * game[i] = {
 *            "id": Integer,
 *            "globalGameId": Integer,
 *            "team1Name": String,
 *            "team2Name": String, 
 *            "score1": Integer,
 *            "score2": Integer,
 *            "first": Float,
 *            "draw": Float,
 *            "second": Float,
 *            "firstOrDraw": Float,
 *            "DrawOrSecond": Float,
 *            "now_": Integer:,
 *            "bookie": String
 *          }

 */


function copy(obj){
    return JSON.parse(JSON.stringify(obj));
}


async function start(sportKey, SQL_QUERY) {
    const { Pool } = require('pg');
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


async function main(SQL_QUERY){
    const sportKeys = ['SOCCER', 'HOCKEY', 'TENNIS', 'BASEBALL', 'CRICKET', 'BASKETBALL', 'VOLLEYBALL', 'HANDBALL', 'FUTSAL', 'TABLE_TENNIS', 'WATER_POLO', 'CYBERSPORT', 'SNOOKER', 'AMERICAN_FOOTBALL'];
    for (sportKey of sportKeys){
        console.log('START', sportKey);
        start(sportKey, SQL_QUERY);
    }
}

if (require.main === module) {
    const SQL_QUERY=`INSERT INTO results (
        id1,
        id2,
        sportkey,
        game1Team1Name,
        game2Team1Name,
        game1Team2Name,
        game2Team2Name,
        similarityNames,
        similarityOutcomes,
        similarityScores,
        totalSimilarity,
        needGroup,
        grouped
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
    main(SQL_QUERY);
}

module.exports = compare_games;