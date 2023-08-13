const knex = require('knex');
const config = require('./knexfile');
const fs = require('fs')
// const getRes = require('./names')
const similarityNames = require('./similarityNames.js');
const lodash = require('lodash');

const db = knex(config.development);

const TIK_STEP = 3;

// границы сдвига
const START_SHIFT = -5;
const FIN_SHIFT = 5;

// допустимая дистанция между играми для каждого вида спорта (мин)
const maxSportStartTimeDistance = {
    "AMERICAN_FOOTBALL": 60,
    "BASEBALL": 60,
    "BASKETBALL": 60,
    "CRICKET": 60,
    "CYBERSPORT": 60,
    "FUTSAL": 60,
    "HANDBALL": 60,
    "HOCKEY": 60,
    "SNOOKER": 60,
    "SOCCER": 60,
    "TABLE_TENNIS": 30,
    "TENNIS": 60,
    "VOLLEYBALL": 60,
    "WATER_POLO": 60,

}


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
    return lodash.cloneDeep(obj);
    // return JSON.parse(JSON.stringify(obj));
}

function formatDataGames(game1, game2, outcomes=true){
    const minTime = Math.floor(Math.max(game1[0].now, game2[0].now) / 1000);
    const maxTime = Math.floor(Math.min(game1.at(-1).now, game2.at(-1).now) / 1000);

    const newGame1 = {};
    const newGame2 = {};
    
    const path1 = game1[0].path;
    const path2 = game2[0].path;
    
    var lastStateGame1 = {};
    lastStateGame1[path1] = {ind: 0, time: minTime, val: null};
    var lastStateGame2 = {};
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
    
    lastStateGame1 = null;
    lastStateGame2 = null;

    return [newGame1, newGame2];
}

function compareOutcomes(game1, game2){
    var newGames = formatDataGames(game1, game2);
    const newGame1 = copy(newGames[0]);
    const newGame2 = copy(newGames[1]);
    newGames = null;

    var totalSimOutcOnTik = {};
    var totalSimOutc = {};

    // ___________Сравнение_данных______________
    for (const tik in newGame1){
        for (const outcomePath in newGame1[tik]){
            if (outcomePath in newGame2[tik] && newGame2[tik][outcomePath].val && newGame1[tik][outcomePath].val){
                const d1 = newGame1[tik][outcomePath].val;
                const d2 = newGame2[tik][outcomePath].val;
                if (d1 !== null && d2 !== null && d1 > 0 && d2 > 0){
                    const simTwoOutcome = Math.min(d1, d2) / Math.max(d1, d2);
                    if (!(outcomePath in totalSimOutcOnTik)) totalSimOutcOnTik[outcomePath] = {sim: 0, count: 0};
                    totalSimOutcOnTik[outcomePath].sim += simTwoOutcome;
                    totalSimOutcOnTik[outcomePath].count ++;
                }
            }
        }
    }
    for (let key in totalSimOutcOnTik){
        totalSimOutc[key] = totalSimOutcOnTik[key].sim / totalSimOutcOnTik[key].count;
    }
    totalSimOutcOnTik = null;
    const result = Object.values(totalSimOutc);
    totalSimOutc = null;
    return sum(result) / result.length;
}

function compareScores(game1, game2){
    var newGames = formatDataGames(game1, game2, false);
    const newGame1 = copy(newGames[0]);
    const newGame2 = copy(newGames[1]);

    newGames = null;

    var totalSimOutcOnTik = {};
    var totalSimOutc = {};

    const maxScore = {};

    for (let tik in newGame1){
        for (let path in newGame1[tik]){
            if (!(path in maxScore)){
                maxScore[path] = newGame1[tik][path].val;
            } else if (newGame1[tik][path].val > maxScore[path]){
                maxScore[path] = newGame1[tik][path].val;
            }
        }
        for (let path in newGame2[tik]){
            if (path in maxScore && newGame2[tik][path].val > maxScore[path]){
                maxScore[path] = newGame2[tik][path].val;
            }
        }
    }

    // ___________Сравнение_данных______________
    for (const tik in newGame1){
        for (const outcomePath in newGame1[tik]){
            if (outcomePath in newGame2[tik] && newGame2[tik][outcomePath].val && newGame1[tik][outcomePath].val){
                const d1 = newGame1[tik][outcomePath].val;
                const d2 = newGame2[tik][outcomePath].val;
                if (d1 !== null && d2 !== null){
                    const simTwoOutcome = 1 - Math.abs(d1 - d2) / maxScore[outcomePath];
                    if (!(outcomePath in totalSimOutcOnTik)) totalSimOutcOnTik[outcomePath] = {sim: 0, count: 0};
                    totalSimOutcOnTik[outcomePath].sim += simTwoOutcome;
                    totalSimOutcOnTik[outcomePath].count ++;
                }
                
            }
        }
    }
    for (let key in totalSimOutcOnTik){
        totalSimOutc[key] = totalSimOutcOnTik[key].sim / totalSimOutcOnTik[key].count;
    }
    totalSimOutcOnTik = null;
    const result = Object.values(totalSimOutc);
    totalSimOutc = null;
    return sum(result) / result.length;
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
    console.log(sportKey);


    while (true){
        const game1Ids = await db('games')
            .join('outcomes', 'games.id', 'outcomes.id')
            .select(
                'games.id', 'games.bookieKey', 'games.team1Name', 'games.team2Name',
                'games.isLive', 'games.globalGameId', 'games.startTime', 'games.liveFrom', 'games.sportKey'
                )
            .min('outcomes.now as startExist')
            .max('outcomes.now as finExist')
            .where('games.sportKey', sportKey)
            .groupBy('games.id')
            .orderBy('startExist', 'desc')
            .limit(20) // получение списка id1
        
        if (game1Ids){
            for (let numId1=0;numId1<game1Ids.length;numId1++){
                // const used = process.memoryUsage();
                // console.log(used);
                const game1Id = game1Ids[numId1];
                if (game1Id.startExist === null || game1Id.finExist === null || (new Date().getTime() - game1Id.startExist) / 3600000 > TIMELIVEGAME) continue;

                if ((game1Id.finExist - game1Id.startExist) / 60000 >= TIMEDELTA){    
                    for (let numId2=numId1;numId2<game1Ids.length;numId2++){
                        // const used = process.memoryUsage();
                        // console.log(used);
                        const game2Id = game1Ids[numId2];
                        for (let numKey of ['startTime', 'liveFrom', 'startExist', 'finExist']){
                            game1Id[numKey] = Number(game1Id[numKey]);
                            game2Id[numKey] = Number(game2Id[numKey]);
                        }
                        if (game2Id.id === game1Id.id || game2Id.bookieKey === game1Id.bookieKey) continue;
                        // _______________________________________
                        const pairExist = await db('pairs').select('id').where(function () {
                            this.where('id1', game1Id.id).andWhere('id2', game2Id.id);
                        }).orWhere(function (){
                            this.where('id2', game1Id.id).andWhere('id1', game2Id.id);
                        });
                        if (pairExist.length > 0) continue;
                        // ____________________________________________

                        if (game2Id.startExist == null || game2Id.finExist == null || (new Date().getTime() - game2Id.startExist) / 3600000 > TIMELIVEGAME){
                            continue;
                        }

                        if ((game2Id.finExist - game2Id.startExist) / 60000 >= TIMEDELTA){
                            if (game2Id.finExist < game1Id.startTime || game1Id.finExist < game2Id.startExist) continue;
                            var totalOutcomesPre = 0;
                            var totalOutcomesLive = 0;
                            var totalScores = 0;
                            var timeDiscrepancy = 0;

                            if (game1Id.isLive === true || game2Id.isLive === true){
                                var game1DataOutcomesLive = await db('outcomes').select('*').where('id', game1Id.id).where('isLive', true).orderBy('now', 'asc');
                                var game2DataOutcomesLive = await db('outcomes').select('*').where('id', game2Id.id).where('isLive', true).orderBy('now', 'asc');
                                
                                if (game1DataOutcomesLive.length > 1 && game2DataOutcomesLive.length > 1){
                                    totalOutcomesLive = compareOutcomes(game1DataOutcomesLive, game2DataOutcomesLive);
                                    if (totalOutcomesLive !== totalOutcomesLive || !totalOutcomesLive) totalOutcomesLive = 0;
                                }
                                game1DataOutcomesLive = null;
                                game2DataOutcomesLive = null;
                            }
                            var game1DataOutcomesPre = await db('outcomes').select('*').where('id', game1Id.id).where('isLive', false).orderBy('now', 'asc');
                            var game2DataOutcomesPre = await db('outcomes').select('*').where('id', game2Id.id).where('isLive', false).orderBy('now', 'asc');
                            
                            if (game1DataOutcomesPre.length > 1 && game2DataOutcomesPre.length > 1){
                                totalOutcomesPre = compareOutcomes(game1DataOutcomesPre, game2DataOutcomesPre);
                                if (!totalOutcomesPre || totalOutcomesPre !== totalOutcomesPre) totalOutcomesPre = 0;
                            }
                            game1DataOutcomesPre = null;
                            game2DataOutcomesPre = null;
                            
                            
                            var game1DataScores = await db('scores').select('*').where('id', game1Id.id).orderBy('now', 'asc');
                            var game2DataScores = await db('scores').select('*').where('id', game2Id.id).orderBy('now', 'asc');

                            if (game1DataScores.length > 1 && game2DataScores.length > 1){
                                totalScores = compareScores(game1DataScores, game2DataScores);
                                if (totalScores !== totalScores || !totalScores) totalScores = 0;
                            }
                            game1DataScores = null;
                            game2DataScores = null;
                            
                            if ((game1Id.startTime || game1Id.liveFrom) && (game2Id.startTime || game2Id.liveFrom)){
                                const realStartTimeDistance = Math.min(
                                    ...[
                                        game1Id.startTime && game2Id.startTime ? Math.abs(game1Id.startTime - game2Id.startTime) : null,
                                        game1Id.startTime && game2Id.liveFrom ? Math.abs(game1Id.startTime - game2Id.liveFrom) : null,
                                        game1Id.liveFrom && game2Id.startTime ? Math.abs(game1Id.liveFrom - game2Id.startTime) : null,
                                        game1Id.liveFrom && game2Id.liveFrom ? Math.abs(game1Id.liveFrom - game2Id.liveFrom) : null,
                                    ].filter((distance) => distance !== null)
                                );
                                // console.log(realStartTimeDistance / 60 / 1000)
                                timeDiscrepancy = Math.max(0, 0.8 + 0.2 * (1 - realStartTimeDistance / (maxSportStartTimeDistance[game1Id.sportKey] * 60 * 1000)));
                            }
                            
                            const namesToSim = {
                                game1Name1: game1Id?.team1Name,
                                game2Name1: game2Id?.team1Name,
                                game1Name2: game1Id?.team2Name,
                                game2Name2: game2Id?.team2Name
                            };
                            // const totalNames = await compareNames(namesToSim);
                            // const totalNames = Number(await getRes(...Object.values(namesToSim)));
                            // const forecastNames = {
                                // 'n1+n2': await similarityNames(namesToSim.game1Name1, namesToSim.game2Name1, game1Id.bookieKey, game2Id.bookieKey),
                                // 'n3+n4': await similarityNames(namesToSim.game1Name2, namesToSim.game2Name2, game1Id.bookieKey, game2Id.bookieKey),
                                // 'n1+n4': await similarityNames(namesToSim.game1Name1, namesToSim.game2Name2, game1Id.bookieKey, game2Id.bookieKey),
                                // 'n2+n3': await similarityNames(namesToSim.game2Name1, namesToSim.game1Name2, game2Id.bookieKey, game1Id.bookieKey),
                            // };

                            const [n1n2, n3n4, n1n4, n2n3] = await Promise.all([
                                similarityNames(namesToSim.game1Name1, namesToSim.game2Name1, game1Id.bookieKey, game2Id.bookieKey),
                                similarityNames(namesToSim.game1Name2, namesToSim.game2Name2, game1Id.bookieKey, game2Id.bookieKey),
                                similarityNames(namesToSim.game1Name1, namesToSim.game2Name2, game1Id.bookieKey, game2Id.bookieKey),
                                similarityNames(namesToSim.game2Name1, namesToSim.game1Name2, game2Id.bookieKey, game1Id.bookieKey),
                            ])

                            const totalNames = Math.max(
                                (n1n2.sameWordsCount + n3n4.sameWordsCount) / 2, 
                                (n1n4.sameWordsCount + n2n3.sameWordsCount) / 2);

                            var needGroup = false;
                            if (totalNames >= 0.95 && totalOutcomesPre >= 0.8) needGroup = true;
                            else if (totalNames >= 0.75 && totalOutcomesPre >= 0.9) needGroup = true;
                            else if (totalNames >= 0.95 && (totalOutcomesPre >= 0.8 || totalOutcomesLive >= 0.8) && totalScores >= 0.8) needGroup = true;
                            else if (totalNames >= 0.75 && (totalOutcomesPre >= 0.9 || totalOutcomesLive >= 0.9) && totalScores >= 0.85) needGroup = true;
                            console.log('Comparing...', 
                            {
                                id1: game1Id.id, 
                                id2: game2Id.id, 
                                outcPre: totalOutcomesPre, 
                                outcLive: totalOutcomesLive,
                                scores: totalScores, 
                                names: totalNames, 
                                need: needGroup,
                                timeDiscrepancy: timeDiscrepancy
                            });
                            await db('pairs').insert({
                                'id1': game1Id.id,
                                'id2': game2Id.id,
                                'isLive': game1Id.isLive,
                                'game1Team1Name': game1Id?.team1Name,
                                'game2Team1Name': game2Id?.team1Name,
                                'game1Team2Name': game1Id?.team2Name,
                                'game2Team2Name': game2Id?.team2Name,
                                'similarityNames': totalNames,
                                'similarityOutcomesPre': totalOutcomesPre,
                                'similarityOutcomesLive': totalOutcomesLive,
                                'similarityScores': totalScores,
                                'totalSimilarity': (totalOutcomesPre + totalOutcomesLive + totalScores) / 3,
                                'timeDiscrepancy': timeDiscrepancy,
                                'needGroup': needGroup,
                                'grouped': game1Id.globalGameId === game2Id.globalGameId,
                                'now': new Date().getTime(),
                            })
                            console.log('pair added');
                        }
                        
                    }
                }
            }
        }
    }
}


async function main(){
    const async = require('async');
    // const sportKeys = ['TENNIS', 'SOCCER', 'HOCKEY', 'BASEBALL', 'CRICKET', 'BASKETBALL', 'VOLLEYBALL', 'HANDBALL', 'FUTSAL', 'TABLE_TENNIS', 'WATER_POLO', 'CYBERSPORT', 'SNOOKER', 'AMERICAN_FOOTBALL'];
    const sportKeys = process.env.SPORTKEYS.split(';');
    // await Promise.all(sportKeys.map(sportKey => start(sportKey)));

    // async.parallel(sportKeys.map(sportKey => async.apply(start, sportKey)), (err, results) => {
    // if (err) {
    //     console.error(err);
    // } else {
    //     console.log(results);
    // }
    // });
    
    for (let sportKey of sportKeys){
        console.log('START', sportKey);
        start(sportKey);
    }
}

if (require.main === module) {
    main();
}