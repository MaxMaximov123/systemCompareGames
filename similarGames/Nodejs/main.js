const knex = require('knex');
const config = require('./knexfile');
const fs = require('fs')
// const getRes = require('./names')
const { getSimilarityNames, getGameObjectSetsForSimilarity, findingBestSimilarity } = require('./similarityNames.js');
const lodash = require('lodash');
const { exit } = require('process');

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
    // return lodash.cloneDeep(obj);
    return JSON.parse(JSON.stringify(obj));
}

function formatDataGames(game1, game2, outcomes=true){
    const minTime = Math.floor(Math.min(game1[0].now, game2[0].now) / 1000);
    const maxTime = Math.floor(Math.max(game1.at(-1).now, game2.at(-1).now) / 1000) + TIK_STEP;        

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
        
        for (let indGame1=minInd1; indGame1<game1.length; indGame1++){
            if (Math.floor(game1[indGame1].now / 1000) <= timeStep){
                lastStateGame1[game1[indGame1].path] = {
                    ind: indGame1,
                    time: timeStep,
                    val: outcomes ? game1[indGame1].odds : game1[indGame1].score
                };
            } else break;
        }

        for (let indGame2=minInd2; indGame2<game2.length; indGame2++){
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


async function start(sportKey, params) {
    require('dotenv').config();


    //_______________________________________//

    const TIMEDELTA = 0 // минимальное время игры для ее сравнения (мин)
    const TIMELIVEGAME = 24 // время (в часах) через которое игра удаляется

    //_______________________________________//


    while (true){
        const games = await db('games')
            .join('outcomes', 'games.id', 'outcomes.id')
            .select(
                'games.id', 'games.bookieKey', 'games.team1Name', 'games.team2Name', 'games.team1Id', 'games.team2Id',
                'games.isLive', 'games.globalGameId', 'games.startTime', 'games.liveFrom', 'games.sportKey'
                )
            .where('games.sportKey', sportKey)
            .whereNull('games.unavailableAt')
            .groupBy('games.id')
            .orderBy(params.orderBy.column, params.orderBy.key)
        
        if (games){
            let findingСoupleToGameFunctions = [];
            for (let numGame1=0;numGame1<games.length;numGame1++){
                console.log(sportKey, 'game1', numGame1, '/', games.length);
                const game1 = games[numGame1];
                const gamesNames = {
                    game1: {
                        name1: game1.team1Name,
                        name2: game1.team2Name,
                        bookieKey: game1.bookieKey,
                    },
                }
                
                gamesNames.game1 = await getGameObjectSetsForSimilarity(gamesNames, 'game1');
                const findingСoupleToGame = async (games, game1, gamesNames, numGame1) => {
                    for (let numGame2=numGame1;numGame2<games.length;numGame2++){
                        const game2 = games[numGame2];
                        // console.log(sportKey, 'game2', numGame2, '/', games.length);
                        for (let numKey of ['startTime', 'liveFrom']){
                            game1[numKey] = Number(game1[numKey]);
                            game2[numKey] = Number(game2[numKey]);
                        }
                        if (game2.id === game1.id || game2.bookieKey === game1.bookieKey) continue;

                        var totalSimilarityOutcomesPre = 0;
                        var totalSimilarityOutcomesLive = 0;
                        var totalSimilarityScores = 0;
                        var timeDiscrepancy = 0;
                        let totalSimilarityNames = 0;

                        if ((game1.startTime || game1.liveFrom) && (game2.startTime || game2.liveFrom)){
                            const realStartTimeDistance = Math.min(
                                ...[
                                    game1.startTime && game2.startTime ? Math.abs(game1.startTime - game2.startTime) : null,
                                    game1.startTime && game2.liveFrom ? Math.abs(game1.startTime - game2.liveFrom) : null,
                                    game1.liveFrom && game2.startTime ? Math.abs(game1.liveFrom - game2.startTime) : null,
                                    game1.liveFrom && game2.liveFrom ? Math.abs(game1.liveFrom - game2.liveFrom) : null,
                                ].filter((distance) => distance !== null)
                            );
                            // console.log(realStartTimeDistance / 60 / 1000)
                            timeDiscrepancy = Math.max(0, 0.8 + 0.2 * (1 - realStartTimeDistance / (maxSportStartTimeDistance[game1.sportKey] * 60 * 1000)));
                        }
                        if (timeDiscrepancy < 0.8 && game1.globalGameId !== game2.globalGameId) continue;
                        
                        gamesNames.game2 = {
                            name1: game2.team1Name,
                            name2: game2.team2Name,
                            bookieKey: game2.bookieKey,
                        };

                        const pairExist = (await db('pairs').select('similarityNames').where(function () {
                            this.where('id1', game1.id).andWhere('id2', game2.id);
                        }).orWhere(function (){
                            this.where('id2', game1.id).andWhere('id1', game2.id);
                        }));
                        if (pairExist.length > 0){
                            totalSimilarityNames = pairExist[0].similarityNames;
                        } else {
                            gamesNames.game2 = await getGameObjectSetsForSimilarity(gamesNames, 'game2');
                            totalSimilarityNames = await getSimilarityNames(gamesNames);
                            totalSimilarityNames = totalSimilarityNames[1];
                        }
                        
                        
                        
                        if (totalSimilarityNames < 0.75 && game1.globalGameId !== game2.globalGameId) continue;

                        if (game1.isLive === true || game2.isLive === true){
                            var game1DataOutcomesLive = [];
                            var game2DataOutcomesLive = [];
                            
                            [game1DataOutcomesLive, game2DataOutcomesLive] = await Promise.all([
                                    db('outcomes').select('*').where('id', game1.id).where('isLive', true).orderBy('now', 'asc'),
                                    db('outcomes').select('*').where('id', game2.id).where('isLive', true).orderBy('now', 'asc')
                                ]);
                            if (game1DataOutcomesLive.length > 1 && game2DataOutcomesLive.length > 1){
                                totalSimilarityOutcomesLive = compareOutcomes(game1DataOutcomesLive, game2DataOutcomesLive);
                                if (totalSimilarityOutcomesLive !== totalSimilarityOutcomesLive || !totalSimilarityOutcomesLive) totalSimilarityOutcomesLive = 0;
                            }
                            game1DataOutcomesLive = null;
                            game2DataOutcomesLive = null;
                        }
                        var game1DataOutcomesPre = [];
                        var game2DataOutcomesPre = [];

                        [game1DataOutcomesPre, game2DataOutcomesPre] = await Promise.all([
                            db('outcomes').select('*').where('id', game1.id).where('isLive', false).orderBy('now', 'asc'),
                            db('outcomes').select('*').where('id', game2.id).where('isLive', false).orderBy('now', 'asc')
                        ]);
                        if (game1DataOutcomesPre.length > 1 && game2DataOutcomesPre.length > 1){
                            totalSimilarityOutcomesPre = compareOutcomes(game1DataOutcomesPre, game2DataOutcomesPre);
                            if (!totalSimilarityOutcomesPre || totalSimilarityOutcomesPre !== totalSimilarityOutcomesPre) totalSimilarityOutcomesPre = 0;
                        }
                        game1DataOutcomesPre = null;
                        game2DataOutcomesPre = null;
                        
                        
                        var game1DataScores = [];
                        var game2DataScores = [];

                        [game1DataScores, game2DataScores] = await Promise.all([
                            db('scores').select('*').where('id', game1.id).orderBy('now', 'asc'),
                            db('scores').select('*').where('id', game2.id).orderBy('now', 'asc'),
                        ]);

                        if (game1DataScores.length > 1 && game2DataScores.length > 1){
                            totalSimilarityScores = compareScores(game1DataScores, game2DataScores);
                            if (totalSimilarityScores !== totalSimilarityScores || !totalSimilarityScores) totalSimilarityScores = 0;
                        }
                        game1DataScores = null;
                        game2DataScores = null;

                        totalSimilarityOutcomesLive = Number(totalSimilarityOutcomesLive.toFixed(4));
                        totalSimilarityOutcomesPre = Number(totalSimilarityOutcomesPre.toFixed(4));
                        totalSimilarityScores = Number(totalSimilarityScores.toFixed(4));
                        timeDiscrepancy = Number(timeDiscrepancy.toFixed(4));
                        

                        var needGroup = false;
                        if (totalSimilarityNames >= 0.95 && totalSimilarityOutcomesPre >= 0.75) needGroup = true;
                        else if (totalSimilarityNames >= 0.75 && (totalSimilarityOutcomesPre >= 0.8)) needGroup = true;
                        else if (totalSimilarityNames >= 0.95 && (totalSimilarityOutcomesPre >= 0.8 || totalSimilarityOutcomesLive >= 0.75) && (totalSimilarityScores >= 0.7 || totalSimilarityScores === 0)) needGroup = true;
                        else if (totalSimilarityNames >= 0.75 && (totalSimilarityOutcomesPre >= 0.9 || totalSimilarityOutcomesLive >= 0.8) && (totalSimilarityScores >= 0.75 || totalSimilarityScores === 0)) needGroup = true;
                        // console.log('Comparing...', 
                        // {
                        //     id1: game1.id, 
                        //     id2: game2.id, 
                        //     outcPre: totalSimilarityOutcomesPre, 
                        //     outcLive: totalSimilarityOutcomesLive,
                        //     scores: totalSimilarityScores, 
                        //     names: totalSimilarityNames, 
                        //     need: needGroup,
                        //     timeDiscrepancy: timeDiscrepancy
                        // });
                        if (pairExist.length === 0){
                            const pairId = (await db('pairs').insert({
                                'id1': game1.id,
                                'id2': game2.id,
                                'isLive': game1.isLive,
                                'game1Team1Name': game1?.team1Name,
                                'game2Team1Name': game2?.team1Name,
                                'game1Team2Name': game1?.team2Name,
                                'game2Team2Name': game2?.team2Name,
                                'similarityNames': totalSimilarityNames,
                                'similarityOutcomesPre': totalSimilarityOutcomesPre,
                                'similarityOutcomesLive': totalSimilarityOutcomesLive,
                                'similarityScores': totalSimilarityScores,
                                'totalSimilarity': (totalSimilarityOutcomesPre + totalSimilarityOutcomesLive + totalSimilarityScores) / 3,
                                'timeDiscrepancy': timeDiscrepancy,
                                'needGroup': needGroup,
                                'grouped': game1.globalGameId === game2.globalGameId,
                                'now': new Date().getTime(),
                            }).returning('id'))[0].id;
                            console.log('pair added');
                            try {
                                await db('decisions').insert({
                                    'pairId': pairId,
                                    'similarityNames': totalSimilarityNames,
                                    'similarityOutcomesPre': totalSimilarityOutcomesPre,
                                    'similarityOutcomesLive': totalSimilarityOutcomesLive,
                                    'similarityScores': totalSimilarityScores,
                                    'timeDiscrepancy': timeDiscrepancy,
                                    'needGroup': needGroup,
                                    'grouped': game1.globalGameId === game2.globalGameId,
                                    'createdAt': new Date(),
                                    'game1StartTime': new Date(Number(game1.startTime)),
                                    'game2StartTime': new Date(Number(game2.startTime)),
                                })
                                console.log('decision added');
                            } catch(e) {}
                        } else {
                            const pairForUpdate = (await db('pairs').where(function () {
                                this.where('id1', game1.id).andWhere('id2', game2.id);
                            }).orWhere(function (){
                                this.where('id2', game1.id).andWhere('id1', game2.id)
                            }).select('id', 'needGroup','grouped'))[0];
                            
                            
                            await db('pairs').where(function () {
                                this.where('id1', game1.id).andWhere('id2', game2.id);
                            }).orWhere(function (){
                                this.where('id2', game1.id).andWhere('id1', game2.id);
                            }).update({
                                'isLive': game1.isLive,
                                'similarityNames': totalSimilarityNames,
                                'similarityOutcomesPre': totalSimilarityOutcomesPre,
                                'similarityOutcomesLive': totalSimilarityOutcomesLive,
                                'similarityScores': totalSimilarityScores,
                                'timeDiscrepancy': timeDiscrepancy,
                                'needGroup': needGroup,
                                'grouped': game1.globalGameId === game2.globalGameId,
                                'now': new Date().getTime(),
                            });
                            console.log('update pair');
                            if (pairForUpdate.needGroup !== needGroup ||
                                pairForUpdate.grouped !== (game1.globalGameId === game2.globalGameId)){
                                try {
                                    await db('decisions').insert({
                                        'pairId': pairForUpdate.id,
                                        'similarityNames': totalSimilarityNames,
                                        'similarityOutcomesPre': totalSimilarityOutcomesPre,
                                        'similarityOutcomesLive': totalSimilarityOutcomesLive,
                                        'similarityScores': totalSimilarityScores,
                                        'timeDiscrepancy': timeDiscrepancy,
                                        'needGroup': needGroup,
                                        'grouped': game1.globalGameId === game2.globalGameId,
                                        'createdAt': new Date(),
                                        'game1StartTime': new Date(Number(game1.startTime)),
                                        'game2StartTime': new Date(Number(game2.startTime)),
                                    })
                                    console.log('decision added');
                                } catch(e) {}
                            }
                        }
                        
                    }
                }
                findingСoupleToGameFunctions.push(findingСoupleToGame(games, game1, gamesNames, numGame1));
                if (findingСoupleToGameFunctions.length === 20){
                    await Promise.all(findingСoupleToGameFunctions);
                    findingСoupleToGameFunctions = [];
                }
            }
            await Promise.all(findingСoupleToGameFunctions);
            
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 5));
    }
}


async function main(){
    const async = require('async');
    // const sportKeys = ['TENNIS', 'SOCCER', 'HOCKEY', 'BASEBALL', 'CRICKET', 'BASKETBALL', 'VOLLEYBALL', 'HANDBALL', 'FUTSAL', 'TABLE_TENNIS', 'WATER_POLO', 'CYBERSPORT', 'SNOOKER', 'AMERICAN_FOOTBALL'];
    const sportKeys = process.env.SPORTKEYS.split(';');
    for (let sportKey of sportKeys){
        console.log('START', sportKey);
        start(sportKey, {
            orderBy: {
                column: 'lastUpdate',
                key: 'desc'
            }
        });
        // start(sportKey, {
        //     orderBy: {
        //         column: 'lastUpdate',
        //         key: 'asc'
        //     }
        // });
    }
}

if (require.main === module) {
    main();
}