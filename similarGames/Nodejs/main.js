const knex = require('knex');
const config = require('./knexfile');
const fs = require('fs')

const db = knex(config.development);

const TIK_STEP = 3;

// границы сдвига
const START_SHIFT = -5;
const FIN_SHIFT = 5;


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

async function formatDataGames(game1, game2, outcomes=true){
    const minTime = Math.floor(Math.max(game1[0].now, game2[0].now) / 1000);
    const maxTime = Math.floor(Math.max(game1.at(-1).now, game2.at(-1).now) / 1000);

    const newGame1 = {};
    const newGame2 = {};
    
    const path1 = game1[0].path;
    const path2 = game2[0].path;
    
    const lastStateGame1 = {};
    lastStateGame1[path1] = {ind: 0, time: minTime, val: null};
    const lastStateGame2 = {};
    lastStateGame2[path2] = {ind: 0, time: minTime, val: null};
    
    for (let timeStep=minTime;timeStep<maxTime;timeStep+=TIK_STEP){
        newGame1[timeStep] = {};
        newGame2[timeStep] = {};

        const minInd1 = Math.max(...Object.keys(lastStateGame1).map((key) => {return lastStateGame1[key].ind}));
        const minInd2 = Math.max(...Object.keys(lastStateGame2).map((key) => {return lastStateGame2[key].ind}));
        
        for (let indGame1=minInd1; indGame1<game1.length-1; indGame1++){
            if (Math.floor(game1[indGame1].now / 1000) <= timeStep){
                lastStateGame1[game1[indGame1].path] = {
                    ind: indGame1,
                    time: timeStep,
                    val: outcomes ? game1[indGame1].odds : game1[indGame1].score
                };
            } else break;
        }

        for (let indGame2=minInd2; indGame2<game2.length-1; indGame2++){
            if (Math.floor(game2[indGame2].now / 1000) <= timeStep){
                lastStateGame2[game2[indGame2].path] = {
                    ind: indGame2,
                    time: timeStep,
                    val: outcomes ? game2[indGame2].odds : game2[indGame2].score
                };
            } else break;
        }
        newGame1[timeStep] = copy(lastStateGame1);
        newGame2[timeStep] = copy(lastStateGame2);
    }

    return [newGame1, newGame2];
}

function compareNames(namesData){
    return new Promise((resolve, reject) => {
        const url = process.env.PYTHON_API_URL;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(namesData)
        })
        .then(response => response.json())
        .then(data => {
          const result = Math.min(Number(data.n1), Number(data.n2));
          resolve(result);
        })
        .catch(error => {
          resolve(null);
        });
    })
}

async function compareOutcomes(game1, game2){
    const newGames = await formatDataGames(game1, game2);
    const newGame1 = newGames[0];
    const newGame2 = newGames[1];

    const totalSimOutcOnTik = {};
    const totalSimOutc = {};

    // ___________Сравнение_данных______________
    for (const tik in newGame1){
        for (const outcomePath in newGame1[tik]){
            if (outcomePath in newGame2[tik] && newGame2[tik][outcomePath].val && newGame1[tik][outcomePath].val){
                const d1 = newGame1[tik][outcomePath].val;
                const d2 = newGame2[tik][outcomePath].val;
                const simTwoOutcome = Math.min(d1, d2) / Math.max(d1, d2);
                if (!(outcomePath in totalSimOutcOnTik)) totalSimOutcOnTik[outcomePath] = {sim: 0, count: 0};
                totalSimOutcOnTik[outcomePath].sim += simTwoOutcome;
                totalSimOutcOnTik[outcomePath].count ++;
            }
        }
    }
    for (let key in totalSimOutcOnTik){
        totalSimOutc[key] = totalSimOutcOnTik[key].sim / totalSimOutcOnTik[key].count;
    }
    const result = Object.values(totalSimOutc);
    return [sum(result) / result.length, result.length >= 2 && sum(result) / result.length >= 0.92];



}

async function compareScores(game1, game2){
    const newGames = await formatDataGames(game1, game2, false);
    const newGame1 = newGames[0];
    const newGame2 = newGames[1];

    const totalSimOutcOnTik = {};
    const totalSimOutc = {};

    // ___________Сравнение_данных______________
    for (const tik in newGame1){
        for (const outcomePath in newGame1[tik]){
            if (outcomePath in newGame2[tik] && newGame2[tik][outcomePath].val && newGame1[tik][outcomePath].val){
                const d1 = newGame1[tik][outcomePath].val;
                const d2 = newGame2[tik][outcomePath].val;
                const simTwoOutcome = Math.min(d1, d2) / Math.max(d1, d2);
                if (!(outcomePath in totalSimOutcOnTik)) totalSimOutcOnTik[outcomePath] = {sim: 0, count: 0};
                totalSimOutcOnTik[outcomePath].sim += simTwoOutcome;
                totalSimOutcOnTik[outcomePath].count ++;
            }
        }
    }
    for (let key in totalSimOutcOnTik){
        totalSimOutc[key] = totalSimOutcOnTik[key].sim / totalSimOutcOnTik[key].count;
    }
    const result = Object.values(totalSimOutc);
    return [sum(result) / result.length, result.length > 1 && sum(result) / result.length >= 0.95];



}

function sum(arr){
    let sum_ = 0;
    arr.forEach((val) => sum_ += Number(val));
    return sum_;
}


async function start(sportKey) {
    require('dotenv').config();


    //_______________________________________//

    const TIMEDELTA = 10 // минимальное время игры для ее сравнения (мин)
    const TIMELIVEGAME = 24 // время (в часах) через которое игра удаляется

    //_______________________________________//



    while (true){
        const game1Ids = await db('games').select('id', 'bookieKey', 'team1Name', 'team2Name', 'isLive', 'globalGameId').where('sportKey', sportKey) // получение списка id1
        
        if (game1Ids){
            for (let game1Id of game1Ids){
                const timeFrame1 = (await db('outcomes').min('now as startTime').max('now as finTime').where('id', game1Id.id))[0];
                if (timeFrame1.startTime == null || timeFrame1.finTime == null || (new Date().getTime() - timeFrame1.startTime) / 3600000 > TIMELIVEGAME){
                    db('outcomes').where('id', game1Id.id).del();
                    db('scores').where('id', game1Id.id).del();
                    console.log('DELETE game1', game1Id.id);
                    continue;
                }
                if ((timeFrame1.finTime - timeFrame1.startTime) / 60000 >= TIMEDELTA){    
                    const game2Ids = await db('games').select('id', 'bookieKey', 'team1Name', 'team2Name', 'isLive', 'globalGameId').where('sportKey', sportKey).where('isLive', game1Id.isLive).whereNot('id', game1Id.id).whereNot('bookieKey', game1Id.bookieKey); // получение списка id2
                    for (let game2Id of game2Ids){
                        const timeFrame2 = (await db('outcomes').min('now as startTime').max('now as finTime').where('id', game2Id.id))[0];
                        if (timeFrame2.startTime == null || timeFrame2.finTime == null || (new Date().getTime() - timeFrame2.startTime) / 3600000 > TIMELIVEGAME){
                            db('outcomes').where('id', game2Id.id).del();
                            db('scores').where('id', game2Id.id).del();
                            console.log('DELETE game2', game2Id.id);  
                            continue;
                        }

                        const pairExist = await db('pairs').select('id').where(function () {
                            this.where('id1', game1Id.id).andWhere('id2', game2Id.id);
                        }).orWhere(function (){
                            this.where('id2', game1Id.id).andWhere('id1', game2Id.id);
                        });

                        if (pairExist.length === 0){
                            if ((timeFrame2.finTime - timeFrame2.startTime) / 60000 >= TIMEDELTA){
                                if (timeFrame1.finTime < timeFrame2.startTime || timeFrame2.finTime < timeFrame1.startTime) {
                                    console.log('SKIP', game1Id.id, game2Id.id)
                                    continue;
                                }
                                const game1DataOutcomes = await db('outcomes').select('*').where('id', game1Id.id).orderBy('now', 'asc');
                                const game2DataOutcomes = await db('outcomes').select('*').where('id', game2Id.id).orderBy('now', 'asc');
                                const game1DataScores = await db('scores').select('*').where('id', game1Id.id).orderBy('now', 'asc');
                                const game2DataScores = await db('scores').select('*').where('id', game2Id.id).orderBy('now', 'asc');
                                if (game1DataOutcomes.length > 1 && game1DataOutcomes.length > 1 && game1DataScores.length > 1 && game2DataScores.length){
                                    const totalOutcomes = await compareOutcomes(game1DataOutcomes, game2DataOutcomes);
                                    const totalScores = await compareScores(game1DataScores, game2DataScores);
                                    const namesToSim = {
                                        game1Name1: game1Id?.team1name,
                                        game2Name1: game2Id?.team1name,
                                        game1Name2: game1Id?.team2name,
                                        game2Name2: game2Id?.team2name
                                    };
                                    totalNames = await compareNames(namesToSim);
                                    console.log('Comparing...', game1Id.id, game2Id.id, totalOutcomes, totalScores);
                                    const pairExist = await db('pairs').select('id').where(function () {
                                        this.where('id1', game1Id.id).andWhere('id2', game2Id.id);
                                    }).orWhere(function (){
                                        this.where('id2', game1Id.id).andWhere('id1', game2Id.id);
                                    });
            
                                    if (pairExist.length === 0){
                                    try {
                                        await db('pairs').insert({
                                            'id1': game1Id.id,
                                            'id2': game2Id.id,
                                            'isLive': game1Id.isLive,
                                            'game1Team1Name': game1Id?.team1Name,
                                            'game2Team1Name': game2Id?.team1Name,
                                            'game1Team2Name': game1Id?.team2Name,
                                            'game2Team2Name': game2Id?.team2Name,
                                            'similarityNames': totalNames,
                                            'similarityOutcomes': totalOutcomes[0],
                                            'similarityScores': totalScores[0],
                                            'totalSimilarity': (totalOutcomes[0] + totalScores[0]) / 2,
                                            'needGroup': totalOutcomes[1] && totalScores[1],
                                            'grouped': game1Id.globalGameId === game2Id.globalGameId
                                        });
                                        console.log('pair added');
                                    } catch (error) {
                                        console.log(error);
                                    }
                                }

                                }
                            }
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
    // const sportKeys = ['TENNIS', 'SOCCER', 'HOCKEY', 'BASEBALL', 'CRICKET', 'BASKETBALL', 'VOLLEYBALL', 'HANDBALL', 'FUTSAL', 'TABLE_TENNIS', 'WATER_POLO', 'CYBERSPORT', 'SNOOKER', 'AMERICAN_FOOTBALL'];
    const sportKeys = process.env.SPORTKEYS.split(';')
    for (sportKey of sportKeys){
        console.log('START', sportKey);
        start(sportKey);
    }
}

if (require.main === module) {
    main();
}