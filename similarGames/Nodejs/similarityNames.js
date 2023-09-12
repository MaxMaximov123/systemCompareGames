const { copyFileSync, cpSync, realpath } = require('fs');
const lodash = require('lodash');
const { devNull } = require('os');

const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);

const minimumCharCount = 3;
const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const dictionary = {
    'а': ['a', 'o', 'u'], 
    'б': ['b'], 
    'в': ['v', 'w'], 
    'г': ['g', 'h', 'q', 'gu', 'gh'],
    'д': ['d'],
    'е': ['e', 'y', 'i', 'j', 'a', 'ie', 'ye', 'io', 'je', 'ea'], 
    'ё': ['y', 'i', 'o', 'io', 'yo', 'jo'],
    'ж': ['z', 'j', 'g', 'zh'], 
    'з': ['z', 't', 's', 'e'], 
    'и': ['i', 'e', 'y', 'j', 'ee', 'ij', 'ji', 'ea'],
    'й': ['i', 'y', 'j'], 
    'к': ['k', 'c', 'q', 'h', 'ck'], 
    'л': ['l', 'll', 'gl'],
    'м': ['m'], 
    'н': ['n', 'm', 'ng', 'gn'],
    'о': ['o', 'a', 'e', 'u', 'au'], 
    'п': ['p'], 
    'р': ['r', 'rh'], 
    'с': ['s', 'c', 'z', 'ts', 'x'], 
    'т': ['t', 'c', 'th'],
    'у': ['u', 'o', 'w', 'oo', 'wu', 'ou', 'yu'], 
    'ф': ['f'], 
    'х': ['h', 'k', 'j', 'ch', 'kh', 'c'],
    'ц': ['c', 't', 's', 'z', 'ts'], 
    'ч': ['c', 'z', 'j', 'ch', 'cz'], 
    'ш': ['s', 'h', 'c', 'sh', 'sz', 'sch'],
    'щ': ['s', 'h', 'c', 'szcz'], 
    'ъ': [''], 
    'ы': ['y', 's', 'a'], 
    'ь': ['', 'i', 'y'],
    'э': ['e', 'ye', 'a', 'o'],
    'ю': ['u', 'i', 'y', 'w', 'iu', 'yu', 'ju'], 
    'я': ['j', 'a', 'i', 'ia', 'ya', 'y', 'ja'],

    'ай': ['ai', 'ay', 'i'],
    'ий': ['y', 'ei', 'ey', 'i'],
    'дж': ['dj', 'dg'],
    'дз': ['dz'],
    'ей': ['ey'],
    'из': ['iz'],
    'кх': ['kh'],
    'цз': ['ji'],
    'нк': ['nj'],
    'ья': ['a', 'y', 'i'],
    // other words
    'a': ['a'],
    'ö': ['o'],
    'ü': ['u', 'o'],
    'y': ['y', 'i'],
    'u': ['u', 'o'],
    'c': ['c', 's'],
    's': ['s', 'c'],
    'i': ['y', 'e', 'i'],
    'II': ['2', ],
    'ie': ['ie', 'ye'],
    'ch': ['ch'],
    'br': ['br'],
    'e': ['e', 'a', 'ai'],
    'ai': ['ai'],
    'ay': ['ay'],
    'au': ['au'],
    'ä': ['a'],
    'ia': ['ia'],
    'gl': ['gl'],
    'gu': ['gu'],
    'gn': ['gn'],
    'gh': ['gh'],
    'io': ['io'],
    'kh': ['kh'],
    'ye': ['ye', 'ie'],
    'ts': ['ts'],
    'ya': ['ya'],
    'yu': ['yu'],
    'iu': ['iu'],
    'ju': ['ju'],
    'ge': ['ge'],
    'th': ['th'],
    'ee': ['ee'],
    'dg': ['dg'],
    'ng': ['ng'],
    'ji': ['ji'],
    'ij': ['ij'],
    'ey': ['ey'],
    'iz': ['iz'],
    'br': ['br'],
    'ck': ['ck'],
    'ch': ['ch'],
    'jo': ['jo'],
    'ja': ['ja'],
    'cz': ['cz'],
    'sz': ['sz'],
    'sh': ['sh'],
    'szcz': ['szcz'],
    'sch': ['sch'],
    'wu': ['wu'],
    'nj': ['nj'],
    'rh': ['rh'],
    'ou': ['ou'],
    'll': ['ll'],
    'ea': ['ea'],
    'zh': ['zh']

}

const maximumLengthKeySlovet = Math.max(...Object.keys(dictionary).map(key => key.length));
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
        [/\scity\s/gi, ' '],
        [/-pro\s/gi, ' '],

    ],
    "OLIMP": [
        [/\s\(до\s\d+\)\s/gi, ' '],
        [/\sesports?\s/gi, ' '],
        [/\s\(жен\)\s/gi, ' '],
        [/\s\(рез\)\s/gi, ' '],
        [/\sунив\.?\s/gi, ' '],
        [/\sуниверситет\s/gi, ' '],
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
        [/\scity\s/gi, ' '],
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
        [/\suniversity\s/gi, ' '],
        [/\s\(women\)\s/gi, ' '],
        [/\sreserves\s/gi, ' '],
        [/\sпро\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\scity\s/gi, ' '],
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
        [/\suniversity\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\s\(U\d+\)\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\scity\s/gi, ' '],
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
        [/\suniversity\s/gi, ' '],
        [/\sreserves\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\sF\.C\.\s/gi, ' '],
        [/\sSV\s/gi, ' '],
        [/\sSve\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\scity\s/gi, ' '],
        [/\sca\s/gi, ' '],
        [/-pro\s/gi, ' '],


    ],
    "FONBET": [
        [/\suniversity\s/gi, ' '],
        [/\s\(univ\)\s/gi, ' '],
        [/\suniv\.?\s/gi, ' '],
        [/\s\(w\)\s/gi, ' '],
        [/\s\(r\)\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\sesports?\s/gi, ' '],
        [/\sU\d+\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sfc\s/gi, ' '],
        [/\scity\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
        [/\sca\s/gi, ' '],
        [/-pro\s/gi, ' '],
    ],
}

const allTranslatedWords = {};
async function updateTranslations(){
    const result = (await db('translations').select('originalWord', 'translationWord'));
    for (let wordPair of result){
        allTranslatedWords[wordPair.originalWord] = Array.from(new Set(wordPair.translationWord.split(';').slice(0, 2)));
    }
}
updateTranslations();
setInterval(updateTranslations, 1000 * 60 * 10);

const unimportantComponents = [
    '-', ',', ':', '*', '/', '|',
    '[', ']', '(', ')', '.'
]

function capitalizeFirstLetter(string) {
    return string[0] + string.charAt(1).toUpperCase() + string.slice(2);
}

const googleTranslateURL = (from, to, txt) => 
    `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&q=${encodeURIComponent(txt)}`

function clearingName(name, bookieKey){
    for (let replacement of replacements[bookieKey]){
        name = name.replace(replacement[0], replacement[1]);
    }
    name = name.replace(/(.)\1+/g, '$1')
    name = name.replace(/\s+/g, ' ');
    return name;
}


function Transliteration(word) {
    let words = {};
    const maxWordLength = word.length;

    function backtrack(currentWord, index, wood) {
        wood[currentWord] = {};
        if (index === maxWordLength){
            return;
        }

        let sequenceCharacters = word[index]
        const currentSymbolsTranslations = (dictionary[word[index]] || [word[index]]).map(char => {return {str: char, ind: index}});
        for (let sequenceCharacterNumber=index+1;sequenceCharacterNumber<
            index+maximumLengthKeySlovet;sequenceCharacterNumber++){
                if (!word[sequenceCharacterNumber]) break;
            sequenceCharacters += word[sequenceCharacterNumber];
            if (dictionary[sequenceCharacters]){
                currentSymbolsTranslations.push(...dictionary[sequenceCharacters].map(char => {return {str: char, ind: sequenceCharacterNumber}}));
            }    
        }
        for (let dict of currentSymbolsTranslations) {
            backtrack(dict.str, dict.ind+1, wood[currentWord]);
        }
    }
    backtrack('1', 0, words);
    return words['1'];
}

function translate(word){
    return allTranslatedWords[word] || [];
}

function wordToOption(word){
    const options = [];
    options.push(Transliteration(word));
    for (let translatedWord of translate(word)){
        options.push(Transliteration(translatedWord.toLowerCase()));
    }
    // if (word.length <= 4){
    //     for (let char of word){
    //         options.push(Transliteration(char));
    //     }
    // }
    return {word: word, options: options};
}

function searchWordsThatMatch(name1WordOption, name2WordOption){
    let result = {word: '', matched: false, countChars: 0};

    function allVariationword(countChars, word, localName1WordOption, localName2WordOption){
        if (result.matched) return;
        if (Object.keys(localName1WordOption).length === 0 || Object.keys(localName2WordOption).length === 0){
            result.word = word;
            result.matched = true;
            result.countChars = countChars;
            return;
        }
        for (let name1OptionChar of Object.keys(localName1WordOption)){
            if (result.matched) return;
            for (let name2OptionChar of Object.keys(localName2WordOption)){
                if (result.matched) return;
                if (name1OptionChar === name2OptionChar){
                    allVariationword(countChars + 1, word + name1OptionChar, localName1WordOption[name1OptionChar], localName2WordOption[name2OptionChar]);
                    break;
                } else if (name1OptionChar === ''){
                    allVariationword(countChars + 1, word + name2OptionChar, localName1WordOption[name1OptionChar], localName2WordOption);
                    break;
                } else if (name2OptionChar === ''){
                    allVariationword(countChars + 1, word + name1OptionChar, localName1WordOption, localName2WordOption[name2OptionChar]);
                    break;
                }
            }
        }
        if (result.word === '') result = {word: word, matched: false, countChars: countChars};
        return;
    }
    allVariationword(0, '', name1WordOption, name2WordOption);
    return result;
}

function findingBestSimilarity(name1Options, name2Options){
    [name1Options, name2Options] = [name1Options, name2Options].slice();
    const pairsWithTheBestSimilarity = [];
    let sameWordsCount = 0;
    let minimumSetLength = Math.min(name1Options.length, name2Options.length);
    let maximumSetLength = Math.max(name1Options.length, name2Options.length);
    if (name2Options.length === minimumSetLength){
        [name1Options, name2Options] = [name2Options, name1Options];
    }
    const namesSets = {
        name1Set: [],
        name2Set: [],
        countChars: [],
    }
    for (let numName1Options=0;numName1Options<name1Options.length;numName1Options++){
        const name1WordOptions = name1Options[numName1Options];
        for (let numName2Options=0;numName2Options<name2Options.length;numName2Options++){
            const name2WordOptions = name2Options[numName2Options];
            for (let name1WordOption of name1WordOptions.options){
                if (namesSets.name1Set[numName1Options]?.matched) break;
                namesSets.name1Set[numName1Options] = {
                    realWord: name1WordOptions.word,
                    modifiedWord: '',
                    matched: false
                };
                for (let name2WordOption of name2WordOptions.options){
                    if (namesSets.name1Set[numName1Options]?.matched) break;
                    namesSets.name2Set[numName1Options] = {
                        realWord: name2WordOptions.word, 
                        modifiedWord: '',
                        matched: false,
                    };
                    const wordsThatMatched = searchWordsThatMatch(name1WordOption, name2WordOption);
                    // console.log(wordsThatMatched)
                    // console.log(namesSets.name1Set[numName1Options], wordsThatMatched.matched)
                    if (wordsThatMatched.matched){
                        sameWordsCount++
                        namesSets.name1Set[numName1Options] = {
                            realWord: name1WordOptions.word,
                            modifiedWord: wordsThatMatched.word,
                            matched: wordsThatMatched.matched
                        };
                        namesSets.name2Set[numName1Options] = {
                            realWord: name2WordOptions.word, 
                            modifiedWord: wordsThatMatched.word,
                            matched: wordsThatMatched.matched,
                        };
                        break;
                    }
                }
                
            }
        }
        
    }
    let fullWordExist = false;
    let fullWordMatched = false;
    for (let numWord=0;numWord<namesSets.name1Set.length;numWord++){
        if (namesSets.name1Set[numWord].realWord.length >= minimumCharCount || namesSets.name2Set[numWord].realWord.length >= minimumCharCount) fullWordExist = true;
        if (namesSets.name1Set[numWord].realWord.length >= minimumCharCount && namesSets.name2Set[numWord].realWord.length >= minimumCharCount && namesSets.name1Set[numWord].matched) fullWordMatched = true;
    }
    let sameWordsPercent = !fullWordExist || fullWordMatched ? sameWordsCount / namesSets.name1Set.length : 0;
    // console.log(namesSets)
    return {namesSets: namesSets, sameWordsPercent: sameWordsPercent};
}

async function getGameObjectSetsForSimilarity(games){
    games.name1 = ' ' + games.name1 + ' ';
    games.name2 = ' ' + games.name2 + ' ';

    games.name1 = clearingName(games.name1, games.bookieKey);
    games.name2 = clearingName(games.name2, games.bookieKey);

    games.name1 = games.name1.toLowerCase();
    games.name2 = games.name2.toLowerCase();

    games.name1Words = games.name1.match(/[\p{Letter}\p{Mark}\p{Number}]+/ug) || [];
    games.name2Words = games.name2.match(/[\p{Letter}\p{Mark}\p{Number}]+/ug) || [];

    games.name1Options = games.name1Words.map(word => wordToOption(word));
    games.name2Options = games.name2Words.map(word => wordToOption(word));

    return games;
}


async function getSimilarityNames(games){
    const similarityNames = {
        game1Name1game2Name1: findingBestSimilarity(games.game1.name1Options, games.game2.name1Options),
        game1Name2game2Name2: findingBestSimilarity(games.game1.name2Options, games.game2.name2Options),
        game1Name1game2Name2: findingBestSimilarity(games.game1.name1Options, games.game2.name2Options),
        game1Name2game2Name1: findingBestSimilarity(games.game1.name2Options, games.game2.name1Options),
    }
    // delete games.game2.name1WordSets;
    // delete games.game2.name2WordSets;
    let isInverted = false;
    let totalSimilarity = (similarityNames.game1Name1game2Name1.sameWordsPercent + similarityNames.game1Name2game2Name2.sameWordsPercent) / 2;
    if (
        (similarityNames.game1Name1game2Name1.sameWordsPercent + similarityNames.game1Name2game2Name2.sameWordsPercent) / 2 <
        (similarityNames.game1Name1game2Name2.sameWordsPercent + similarityNames.game1Name2game2Name1.sameWordsPercent) / 2
    ){
        isInverted = true;
        totalSimilarity = (similarityNames.game1Name1game2Name2.sameWordsPercent + similarityNames.game1Name2game2Name1.sameWordsPercent) / 2;
    }
    games = {};
    return {
        obj: Object.values(similarityNames).map(obj => obj.namesSets), 
        totalSimilarity: totalSimilarity,
        isInverted: isInverted
    };
}


// main();

// _____________________Example_______________


const example = async () => {
    t = new Date();
    let games = {"game1":{"name1":"Hong Kong U23","name2":"Afghanistan U23","bookieKey":"BET365"},"game2":{"name1":"Гонконг (до 23)","name2":"Афганистан (до 23)","bookieKey":"OLIMP"}}
    games.game1 = await getGameObjectSetsForSimilarity(games.game1);
    games.game2 = await getGameObjectSetsForSimilarity(games.game2);
    console.log(await getSimilarityNames(games));
    console.log(new Date() - t);
};

// const { Translator } = require('google-translate-api-x');
// const translator = new Translator({from: 'auto', to: 'en', forceBatch: false, tld: 'es'});
// await translator.translate(['привет', 'пока']);

// example();
// setTimeout(example, 5000);
// console.log(Transliteration('caen')['s'])
module.exports = { getSimilarityNames, getGameObjectSetsForSimilarity, findingBestSimilarity };