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
    
    let lastStateGame1 = {};
    lastStateGame1[path1] = {ind: 0, time: minTime, val: null};
    let lastStateGame2 = {};
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
    let newGames = formatDataGames(game1, game2);
    const newGame1 = copy(newGames[0]);
    const newGame2 = copy(newGames[1]);
    newGames = null;

    let totalSimOutcOnTik = {};
    let totalSimOutc = {};

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
    let newGames = formatDataGames(game1, game2, false);
    const newGame1 = copy(newGames[0]);
    const newGame2 = copy(newGames[1]);

    newGames = null;

    let totalSimOutcOnTik = {};
    let totalSimOutc = {};

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

function postRequest(url, data){
    return new Promise((resolve, reject) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    
    fetch(url, options)
    .then(response => response.json())
    .then(result => {
        resolve(result);
    })
    .catch(error => {
        reject(error);
    });
    })
}


async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

async function start(sportKey, params) {
    require('dotenv').config();


    //_______________________________________//

    const TIMEDELTA = 0 // минимальное время игры для ее сравнения (мин)
    const TIMELIVEGAME = 24 // время (в часах) через которое игра удаляется

    //_______________________________________//

    const newPairsTransactions = [];
    const newDecisionsTransactions = [];
    const updatePairsTransactions = [];
    const addingNewPairs = setInterval(async () =>{
        let newPairsTransactionsForAdding = newPairsTransactions.slice();
        newPairsTransactions.length = 0;
        // console.log(newPairsTransactionsForAdding, 'pairs');
        if (newPairsTransactionsForAdding.length > 0){
            const pairId = (await db('pairs').insert(newPairsTransactionsForAdding).returning('id'))[0].id;
            console.log('pairs added');
        }


    }, 5000);

    let allGames = {};
    let newGames = await db('games')
        .select(
            'games.id', 'games.bookieKey', 'games.team1Name', 'games.team2Name', 'games.team1Id', 'games.team2Id',
            'games.isLive', 'games.globalGameId', 'games.startTime', 'games.liveFrom', 'games.sportKey', 'leagueId',
            'team1Id', 'team2Id'
            )
        .where('games.sportKey', sportKey)
        .whereNull('games.unavailableAt')
        .groupBy('games.id')
        .orderBy(params.orderBy.column, params.orderBy.key);
    
    let countGames = 0;
    for (let game of newGames){
        allGames[game.id] = game;
        allGames[game.id].gameNames = {
            name1: game.team1Name,
            name2: game.team2Name,
            bookieKey: game.bookieKey,
        };
        allGames[game.id].gameNames = await getGameObjectSetsForSimilarity(allGames[game.id].gameNames);                
        console.log(countGames, '/', newGames.length);
        countGames++;
    }
    let gamesForComparison = Object.values(allGames).slice();
    while (true){
        let findingСoupleToGameFunctions = [];
        for (let numGame1=0;numGame1<gamesForComparison.length;numGame1++){
            // console.log(sportKey, 'game1', numGame1, '/', games.length);
            const game1 = gamesForComparison[numGame1];
            const findingСoupleToGame = async (gamesForComparison, game1, numGame1) => {
                for (let numGame2=numGame1;numGame2<gamesForComparison.length;numGame2++){
                    const game2 = gamesForComparison[numGame2];
                    console.log(sportKey, 'game1', numGame1, 'game2', numGame2, '/', gamesForComparison.length);
                    for (let numKey of ['startTime', 'liveFrom']){
                        game1[numKey] = Number(game1[numKey]);
                        game2[numKey] = Number(game2[numKey]);
                    }
                    if (game2.id === game1.id || game2.bookieKey === game1.bookieKey) continue;

                    let totalSimilarityOutcomesPre = 0;
                    let totalSimilarityOutcomesLive = 0;
                    let totalSimilarityScores = 0;
                    let timeDiscrepancy = 0;
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
                    
                    let gamesNames = {
                        game1: game1.gameNames,
                        game2: game2.gameNames
                    }
                    // gamesNames = await getGameObjectSetsForSimilarity(gamesNames);
                    totalSimilarityNames = await getSimilarityNames(gamesNames);
                    // console.log(totalSimilarityNames);
                    if (totalSimilarityNames.totalSimilarity < 0.75 && game1.globalGameId !== game2.globalGameId) continue;

                    const pairExist = (await db('pairs').select('similarityNames').where(function () {
                        this.where('id1', game1.id).andWhere('id2', game2.id);
                    }).orWhere(function (){
                        this.where('id2', game1.id).andWhere('id1', game2.id);
                    }));
                    
                    
                    
                    let game1DataScores = [];
                    let game2DataScores = [];

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

                    if (totalSimilarityScores >= 0 && totalSimilarityScores < 0.7) continue;
                    
                    if (game1.isLive === true || game2.isLive === true){
                        let game1DataOutcomesLive = [];
                        let game2DataOutcomesLive = [];
                        
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
                    let game1DataOutcomesPre = [];
                    let game2DataOutcomesPre = [];

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

                    totalSimilarityOutcomesLive = Number(totalSimilarityOutcomesLive.toFixed(4));
                    totalSimilarityOutcomesPre = Number(totalSimilarityOutcomesPre.toFixed(4));
                    totalSimilarityScores = Number(totalSimilarityScores.toFixed(4));
                    timeDiscrepancy = Number(timeDiscrepancy.toFixed(4));
                    
                    let needGroup = false;
                    
                    if (totalSimilarityNames.totalSimilarity >= 0.95 && totalSimilarityOutcomesPre >= 0.75) needGroup = true;
                    else if (totalSimilarityNames.totalSimilarity >= 0.75 && (totalSimilarityOutcomesPre >= 0.8)) needGroup = true;
                    else if (totalSimilarityNames.totalSimilarity >= 0.95 && (totalSimilarityOutcomesPre >= 0.8 || totalSimilarityOutcomesLive >= 0.75) && (totalSimilarityScores >= 0.7 || totalSimilarityScores === 0)) needGroup = true;
                    else if (totalSimilarityNames.totalSimilarity >= 0.75 && (totalSimilarityOutcomesPre >= 0.9 || totalSimilarityOutcomesLive >= 0.8) && (totalSimilarityScores >= 0.75 || totalSimilarityScores === 0)) needGroup = true;
                    
                    console.log('Comparing...', 
                    {
                        id1: game1.id, 
                        id2: game2.id,
                        game1LeagueId: game1.leagueId,
                        game2LeagueId: game2.leagueId,
                        outcPre: totalSimilarityOutcomesPre, 
                        outcLive: totalSimilarityOutcomesLive,
                        scores: totalSimilarityScores, 
                        names: totalSimilarityNames, 
                        need: needGroup,
                        grouped: game1.globalGameId === game2.globalGameId,
                        timeDiscrepancy: timeDiscrepancy
                    });

                    if (needGroup && !(game1.globalGameId === game2.globalGameId)){
                        let dataForAddingInCore = {
                            games: {
                                [Number(game1.id)]: {
                                    leagueId: Number(game1.leagueId),
                                    team1Id: Number(game1.team1Id),
                                    team2Id: Number(game1.team2Id)
                                },
                                [Number(game2.id)]: {
                                    leagueId: Number(game2.leagueId),
                                    team1Id: totalSimilarityNames.isInverted ? Number(game2.team2Id) : Number(game2.team1Id),
                                    team2Id: totalSimilarityNames.isInverted ? Number(game2.team1Id) : Number(game2.team2Id)
                                }
                            },
                            "extend": true,
                            "makingType": "EXTENSION"
                        };
                        console.log(dataForAddingInCore);
                        let response = (await postRequest(
                            'https://sm.livesport.tools/api/game-manager/games/group',
                            dataForAddingInCore
                            ));
                        if (response){
                            console.log(response)
                        }
                    }
                    if (pairExist.length === 0){
                        newPairsTransactions.push({
                            'id1': game1.id,
                            'id2': game2.id,
                            'isLive': game1.isLive,
                            'game1Team1Name': game1?.team1Name,
                            'game2Team1Name': game2?.team1Name,
                            'game1Team2Name': game1?.team2Name,
                            'game2Team2Name': game2?.team2Name,
                            'similarityNames': totalSimilarityNames.totalSimilarity,
                            'similarityOutcomesPre': totalSimilarityOutcomesPre,
                            'similarityOutcomesLive': totalSimilarityOutcomesLive,
                            'similarityScores': totalSimilarityScores,
                            'totalSimilarity': (totalSimilarityOutcomesPre + totalSimilarityOutcomesLive + totalSimilarityScores) / 3,
                            'timeDiscrepancy': timeDiscrepancy,
                            'needGroup': needGroup,
                            'grouped': game1.globalGameId === game2.globalGameId,
                            'now': new Date().getTime(),
                        });
                        try {
                            newDecisionsTransactions.push({
                                'pairId': 1,
                                'similarityNames': totalSimilarityNames.totalSimilarity,
                                'similarityOutcomesPre': totalSimilarityOutcomesPre,
                                'similarityOutcomesLive': totalSimilarityOutcomesLive,
                                'similarityScores': totalSimilarityScores,
                                'timeDiscrepancy': timeDiscrepancy,
                                'needGroup': needGroup,
                                'grouped': game1.globalGameId === game2.globalGameId,
                                'createdAt': new Date(),
                                'game1StartTime': new Date(Number(game1.startTime)),
                                'game2StartTime': new Date(Number(game2.startTime)),
                            });
                            // await db('decisions').insert({
                            //     'pairId': pairId,
                            //     'similarityNames': totalSimilarityNames.totalSimilarity,
                            //     'similarityOutcomesPre': totalSimilarityOutcomesPre,
                            //     'similarityOutcomesLive': totalSimilarityOutcomesLive,
                            //     'similarityScores': totalSimilarityScores,
                            //     'timeDiscrepancy': timeDiscrepancy,
                            //     'needGroup': needGroup,
                            //     'grouped': game1.globalGameId === game2.globalGameId,
                            //     'createdAt': new Date(),
                            //     'game1StartTime': new Date(Number(game1.startTime)),
                            //     'game2StartTime': new Date(Number(game2.startTime)),
                            // })
                            // console.log('decision added');
                        } catch(e) {}
                    } else {
                        // console.log('recapitulating a pair')
                        const pairForUpdate = (await db('pairs').where(function () {
                            this.where('id1', game1.id).andWhere('id2', game2.id);
                        }).orWhere(function (){
                            this.where('id2', game1.id).andWhere('id1', game2.id)
                        }).select('id', 'needGroup','grouped'))[0];
                        
                        if (pairForUpdate.needGroup !== needGroup ||
                            pairForUpdate.grouped !== (game1.globalGameId === game2.globalGameId)){
                            await db('pairs').where(function () {
                                this.where('id1', game1.id).andWhere('id2', game2.id);
                            }).orWhere(function (){
                                this.where('id2', game1.id).andWhere('id1', game2.id);
                            }).update({
                                'isLive': game1.isLive,
                                'similarityNames': totalSimilarityNames.totalSimilarity,
                                'similarityOutcomesPre': totalSimilarityOutcomesPre,
                                'similarityOutcomesLive': totalSimilarityOutcomesLive,
                                'similarityScores': totalSimilarityScores,
                                'timeDiscrepancy': timeDiscrepancy,
                                'needGroup': needGroup,
                                'grouped': game1.globalGameId === game2.globalGameId,
                                'now': new Date().getTime(),
                            });
                            console.log('update pair');
                            try {
                                newDecisionsTransactions.push({
                                    'pairId': pairForUpdate.id,
                                    'similarityNames': totalSimilarityNames.totalSimilarity,
                                    'similarityOutcomesPre': totalSimilarityOutcomesPre,
                                    'similarityOutcomesLive': totalSimilarityOutcomesLive,
                                    'similarityScores': totalSimilarityScores,
                                    'timeDiscrepancy': timeDiscrepancy,
                                    'needGroup': needGroup,
                                    'grouped': game1.globalGameId === game2.globalGameId,
                                    'createdAt': new Date(),
                                    'game1StartTime': new Date(Number(game1.startTime)),
                                    'game2StartTime': new Date(Number(game2.startTime)),
                                });
                                // await db('decisions').insert({
                                //     'pairId': pairForUpdate.id,
                                //     'similarityNames': totalSimilarityNames.totalSimilarity,
                                //     'similarityOutcomesPre': totalSimilarityOutcomesPre,
                                //     'similarityOutcomesLive': totalSimilarityOutcomesLive,
                                //     'similarityScores': totalSimilarityScores,
                                //     'timeDiscrepancy': timeDiscrepancy,
                                //     'needGroup': needGroup,
                                //     'grouped': game1.globalGameId === game2.globalGameId,
                                //     'createdAt': new Date(),
                                //     'game1StartTime': new Date(Number(game1.startTime)),
                                //     'game2StartTime': new Date(Number(game2.startTime)),
                                // });
                                // console.log('decision added');
                            } catch(e) {}
                        }
                    }
                    
                }
            }
            findingСoupleToGameFunctions.push(findingСoupleToGame(gamesForComparison, game1, numGame1));
            if (findingСoupleToGameFunctions.length === 5){
                await Promise.all(findingСoupleToGameFunctions);
                findingСoupleToGameFunctions.length = 0;
            }
        }
        await Promise.all(findingСoupleToGameFunctions);
            
        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        gamesForComparison = [];
        let newGames = await db('games')
            .select(
                'games.id', 'games.bookieKey', 'games.team1Name', 'games.team2Name', 'games.team1Id', 'games.team2Id',
                'games.isLive', 'games.globalGameId', 'games.startTime', 'games.liveFrom', 'games.sportKey', 'leagueId',
                'team1Id', 'team2Id'
                )
            .where('games.sportKey', sportKey)
            .whereNull('games.unavailableAt')
            .groupBy('games.id')
            .orderBy(params.orderBy.column, params.orderBy.key);

        let countGames = 0;
        for (let game of newGames){
            console.log(sportKey, 'game1', countGames, '/', newGames.length);
            countGames++;
            if (allGames[game.id]){
                gamesForComparison.push(allGames[game.id]);
            } else {
                game.gameNames = {
                    name1: game.team1Name,
                    name2: game.team2Name,
                    bookieKey: game.bookieKey,
                };
                game.gameNames = await getGameObjectSetsForSimilarity(game.gameNames);
                gamesForComparison.push(game);
            }
        }
        allGames = {};
        for (let game of gamesForComparison){
            allGames[game.id] = game;
        }
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