const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);

const compareNamesWithCash = require('./compareWords');
const MINIMUM_CHAR_COUNT = 3;
const replacements = {
    "BETRADAR": [
        [/\sesports?\s/gi, ' '],
        [/\sfc\s/gi, ' '],
        [/\sca\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\ssc\s/gi, ' '],
        [/\s\(w\)\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\sSve\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/-pro\s/gi, ' '],

    ],
    "OLIMP": [
        [/\s\(до\s\d+\)\s/gi, ' '],
        [/\sesports?\s/gi, ' '],
        [/\s\(жен\)\s/gi, ' '],
        [/\s\(рез\)\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\sФК\s/gi, ' '],
        [/\sСВ\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\s-про\s/gi, ' '],

    ],
    "VIRGINBET": [
        [/\s\[W\]\s/gi, ' '],
        [/\s\[\w\]\s/gi, ' '],
        [/\sU\d+\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\sesports?\s/gi, ' '],
        [/\sfc\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\sca\s/gi, ' '],
        [/-pro\s/gi, ' '],

    ],
    "BET365": [
        [/\sU\d+\s/gi, ' '],
        [/\sfk\s/gi, ' '],
        [/\sesports?\s/gi, ' '],
        [/\swomen\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\sfc\s/gi, ' '],
        [/\s\(women\)\s/gi, ' '],
        [/\sreserves\s/gi, ' '],
        [/\sпро\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\sca\s/gi, ' '],
        [/-pro\s/gi, ' '],

    ],
    "BETMGM": [
        [/\s\(women\)\s/gi, ' '],
        [/\sfc\s/gi, ' '],
        [/\sfk\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\sc\s/gi, ' '],
        [/\s\([A-Z]{3}\)\s/g, ' '],
        [/\spro\s/gi, ' '],
        [/\s\(U\d+\)\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\sca\s/gi, ' '],
        [/-pro\s/gi, ' '],


    ],
    "PINNACLE": [
        [/\sfc\s/gi, ' '],
        [/\sfk\s/gi, ' '],
        [/\sc\s/gi, ' '],
        [/\sU\d+\s/gi, ' '],
        [/\sesports?\s/gi, ' '],
        [/\syouth\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\sreserves\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\sF\.C\.\s/gi, ' '],
        [/\sSV\s/gi, ' '],
        [/\sSve\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\sca\s/gi, ' '],
        [/-pro\s/gi, ' '],


    ],
    "FONBET": [
        [/\s\(w\)\s/gi, ' '],
        [/\s\(r\)\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\sesports?\s/gi, ' '],
        [/\sU\d+\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sfc\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\sca\s/gi, ' '],
        [/-pro\s/gi, ' '],
    ],
}
const commonWords = [
    'univ',
    'university',
    'city',
    'town',
    'унив',
    'университет',
    'сити'
];

const allTranslatedWords = {};
async function updateTranslations(){
    const result = (await db('translations').select('originalWord', 'translationWord'));
    for (let wordPair of result){
        allTranslatedWords[wordPair.originalWord] = Array.from(new Set(wordPair.translationWord.split(';').slice(0, 2))).map(word => word.toLowerCase());
    }
}
updateTranslations();
setInterval(updateTranslations, 1000 * 60 * 5);

// ---------------------------------- //

gamesNames = {"game1":{"name1":"Qatar","name2":"Bahrain - Twenty20","bookieKey":"BET365"},"game2":{"name1":"Qatar","name2":"Bahrain","bookieKey":"BETRADAR"}}

setTimeout(() => {
    gamesNames.game1 = formatGameNames(gamesNames.game1);
    gamesNames.game2 = formatGameNames(gamesNames.game2);
    console.log(gamesNames.game1);
    console.log(gamesNames.game2);
    console.log(compareAllNames(gamesNames))
}, 5000);


// ---------------------------------- //

function comparePairNames(name1Words, name2Words){
    let result = {
        minLengthName: Math.min(name1Words.length, name2Words.length),
        sameWordsCount: 0,
        name1Words: [],
        name2Words: [],
        sameWordsPercent: 0,
    }
    for (let word1Options of name1Words){
        for (let word2Options of name2Words){
            let resultCompareWords = false;
            for (let word1Option of word1Options){
                if (resultCompareWords || result.name1Words.includes(word1Options[0]) || 
                result.name2Words.includes(word1Options[0])) break;
                for (let word2Option of word2Options){
                    if (resultCompareWords || result.name1Words.includes(word2Options[0]) || 
                    result.name2Words.includes(word2Options[0])) break;
                    resultCompareWords = compareNamesWithCash(word1Option, word2Option);
                    if (resultCompareWords) {
                        result.name1Words.push(word1Options[0]);
                        result.name2Words.push(word2Options[0]);
                        result.sameWordsCount++;
                        break;
                    }
                }
            }
        }
    }
    result.sameWordsPercent = result.sameWordsCount / result.minLengthName;

    let fullWordExist = false;
    for (let numWord=0;numWord<result.name1Words.length;numWord++){
        if (!commonWords.includes(result.name1Words[numWord]) &&
        !commonWords.includes(result.name2Words[numWord]) &&
         result.name1Words[numWord].length >= MINIMUM_CHAR_COUNT && result.name2Words[numWord].length >= MINIMUM_CHAR_COUNT) fullWordExist = true;
    }
    result.sameWordsPercent = fullWordExist ? result.sameWordsPercent : 0;
    // console.log(result);
    return result;
}

function compareAllNames(gamesNames){
    let resultsOfComparing = {
        game1Name1game2Name1: comparePairNames(gamesNames.game1.name1Words, gamesNames.game2.name1Words),
        game1Name2game2Name2: comparePairNames(gamesNames.game1.name2Words, gamesNames.game2.name2Words),
        game1Name1game2Name2: comparePairNames(gamesNames.game1.name1Words, gamesNames.game2.name2Words),
        game1Name2game2Name1: comparePairNames(gamesNames.game1.name2Words, gamesNames.game2.name1Words),
    }
    // console.log(resultsOfComparing.game1Name1game2Name1);
    let resultPairs = {
        leftUpRightDown: {
            sameWordsCount: resultsOfComparing.game1Name1game2Name1.sameWordsCount + resultsOfComparing.game1Name2game2Name2.sameWordsCount,
            averagePercent: (resultsOfComparing.game1Name1game2Name1.sameWordsPercent + resultsOfComparing.game1Name2game2Name2.sameWordsPercent) / 2,
        },
        leftDownRightUp: {
            sameWordsCount: resultsOfComparing.game1Name1game2Name2.sameWordsCount + resultsOfComparing.game1Name2game2Name1.sameWordsCount,
            averagePercent: (resultsOfComparing.game1Name1game2Name2.sameWordsPercent + resultsOfComparing.game1Name2game2Name1.sameWordsPercent) / 2,
        }
    }
    let isInverted = false;
    let totalSimilarity = resultPairs.leftUpRightDown.averagePercent;
    if (resultPairs.leftDownRightUp.averagePercent > resultPairs.leftUpRightDown.averagePercent){
        isInverted = true;
        totalSimilarity = resultPairs.leftDownRightUp.averagePercent;
    } else if (
        resultPairs.leftDownRightUp.averagePercent === resultPairs.leftUpRightDown.averagePercent && 
        resultPairs.leftDownRightUp.sameWordsCount > resultPairs.leftUpRightDown.sameWordsCount){
        isInverted = true;
        totalSimilarity = resultPairs.leftDownRightUp.averagePercent;
    }
    return {
        resultPairs: resultPairs,
        totalSimilarity: totalSimilarity,
        isInverted: isInverted
    };
}



function formatGameNames(game){
    game.name1 = ' ' + game.name1 + ' ';
    game.name2 = ' ' + game.name2 + ' ';

    game.name1 = clearingName(game.name1, game.bookieKey);
    game.name2 = clearingName(game.name2, game.bookieKey);

    game.name1 = game.name1.toLowerCase();
    game.name2 = game.name2.toLowerCase();

    game.name1Words = (game.name1.match(/[\p{Letter}\p{Mark}\p{Number}]+/ug) || [])
        .map(word => Array.from(new Set([word, ...(allTranslatedWords[word] || [])])));
    game.name2Words = (game.name2.match(/[\p{Letter}\p{Mark}\p{Number}]+/ug) || [])
        .map(word => Array.from(new Set([word, ...(allTranslatedWords[word] || [])])));
    return game;
}

function clearingName(name, bookieKey){
    for (let replacement of replacements[bookieKey]){
        name = name.replace(replacement[0], replacement[1]);
    }
    name = name.replace(/(.)\1+/g, '$1')
    name = name.replace(/\s+/g, ' ');
    return name;
}

module.exports = {compareAllNames, formatGameNames};