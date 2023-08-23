const lodash = require('lodash');

const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const dictionary = {
    'а': ['a', 'o', 'u'], 
    'б': ['b'], 
    'в': ['v', 'w'], 
    'г': ['g', 'h'], 
    'д': ['d', 't', 'th'], 
    'е': ['e', 'ye', 'ie', 'y', 'je', 'a'], 
    'ё': ['yo', 'io', 'o'],
    'ж': ['zh', 'j', 'g'], 
    'з': ['z', 'th'], 
    'и': ['i', 'e', 'y', 'ii', 'ie', 'ea'],
    'й': ['i', 'y', 'j'], 
    'к': ['k', 'c', 'kh'], 
    'л': ['l'], 
    'м': ['m'], 
    'н': ['n', 'm', 'ng'],
    'о': ['o', 'oe', 'a'], 
    'п': ['p'], 
    'р': ['r'], 
    'с': ['s', 'c', 'sz', 'z'], 
    'т': ['t', 'ch'], 
    'у': ['u', 'oo', 'o', 'w'], 
    'ф': ['f', 'ph'], 
    'х': ['h', 'ch', 'kh', 'j'],
    'ц': ['c', 'ts'], 
    'ч': ['ch', 'c', 'cz', 'j'], 
    'ш': ['sh', 'sz', 's'],
    'щ': ['sch', 'shch', 'sh', 'ch', 'szcz'], 
    'ъ': [''], 
    'ы': ['y', 's', 'a'], 
    'ь': [''], 
    'э': ['e', 'ie', 'ye', 'a', 'he', 'aeu', 'o'],
    'ю': ['u', 'iu', 'yu', 'y', 'yu'], 
    'я': ['ya', 'ia', 'j', 'a', 'ja'],
    'ай': ['i'],
    'ий': ['y'],
    'дж': ['jo', 'g', 'j'],
    // other words
    'ö': ['o'],
    'y': ['y', 'i'],
    'c': ['c', 's'],
    's': ['s', 'c'],
    'e': ['e', ''],
    'II': ['2', ],
}
const maximumLengthKeySlovet = Math.max(...Object.keys(dictionary).map(key => key.length));
const replacements = {
    "BETRADAR": [
        [/\sesports?\s/gi, ' '],
        [/\sfc\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\ssc\s/gi, ' '],
        [/\s\(w\)\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\sSve\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],

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

    ],
    "VIRGINBET": [
        [/\s\[W\]\s/gi, ' '],
        [/\sU\d+\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\sesports?\s/gi, ' '],
        [/\sfc\s/gi, ' '],
        [/\spro\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],

    ],
    "BET365": [
        [/\sU\d+\s/gi, ' '],
        [/\sfk\s/gi, ' '],
        [/\sesports?\s/gi, ' '],
        [/\swomen\s/gi, ' '],
        [/\scf\s/gi, ' '],
        [/\suniversity\s/gi, ' '],
        [/\s\(women\)\s/gi, ' '],
        [/\sreserves\s/gi, ' '],
        [/\sпро\s/gi, ' '],
        [/\sfv\s/gi, ' '],
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],

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
        [/\sII\s/gi, ' 2 '],
        [/\sIII\s/gi, ' 3 '],
    ],
}

const unimportantComponents = [
    '-', ',', ':', '*', '/', '|',
    '[', ']', '(', ')', '.'
]

function capitalizeFirstLetter(string) {
    return string[0] + string.charAt(1).toUpperCase() + string.slice(2);
}

const googleTranslateURL = (from, to, txt) =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${from}&tl=${to}&q=${txt}`;


function clearingName(name, bookieKey){
    for (let replacement of replacements[bookieKey]){
        name = name.replace(replacement[0], replacement[1]);
    }
    name = name.replace(/\s+/g, ' ');
    return name;
}

function Transliteration(word) {
    let words = [{str: '', ind: -1}];
    for (let indChar = 0; indChar < word.length; indChar++) {
        let sequenceCharacters = word[indChar]
        const currentSymbolsTranslations = (dictionary[word[indChar]] || [word[indChar]]).map(char => {return {str: char, ind: indChar}});
        for (let sequenceCharacterNumber=indChar+1;sequenceCharacterNumber<
            indChar+maximumLengthKeySlovet;sequenceCharacterNumber++){
                if (!word[sequenceCharacterNumber]) break;
            sequenceCharacters += word[sequenceCharacterNumber];
            if (dictionary[sequenceCharacters]){
                currentSymbolsTranslations.push(...dictionary[sequenceCharacters].map(char => {return {str: char, ind: sequenceCharacterNumber}}));
            }    
        }
        let newWords = [];
        for (let dict of currentSymbolsTranslations) {
            for (let existingWord of words) {
                if (dict.ind > existingWord.ind){
                    newWords.push({str: existingWord.str + dict.str, ind: dict.ind});
                } else {
                    newWords.push({str: existingWord.str, ind: existingWord.ind});
                }
            }
        }
        words = [];
        words = newWords.slice();
        newWords = [];
    }
    words = words.map(obj => obj.str);
    words.sort((a, b) => b.length - a.length);
    return words;
  }

// function Transliteration(word) {
//     let words = [''];

//     const transliteration = (word) => {
//         if (word.length === 1) return dictionary[word[0]] || [word[0]];
//         let sequenceCharacters = word[0];
//         const currentSymbolsTranslations = dictionary[word[0]] || [word[0]];
//         for (let sequenceCharacterNumber=1;sequenceCharacterNumber<maximumLengthKeySlovet;sequenceCharacterNumber++){
//             if (!word[sequenceCharacterNumber]) break;
//             sequenceCharacters += word[sequenceCharacterNumber];
//             if (dictionary[sequenceCharacters]){
//                 currentSymbolsTranslations.push(...dictionary[sequenceCharacters]);
//             }    
//         }
//         let newWords = [];
//         for (let symbol of currentSymbolsTranslations) {
//             if (symbol){+
//                 for (let char of transliteration(word.slice(symbol.length))){
//                     console.log(char)
//                     for (let word_ of words) newWords.push(word_ + char);
//                     console.log(newWords)
//                 }
//             }
//         }
//         words = [];
//         words = newWords.slice();
//         newWords = [];
//         return newWords;
//     }

//     transliteration(word);
//     return words;
//   }
  

function createSets(options){
    let nameWordSets = options[0].slice();
    for (let numComponent=1;numComponent<options.length;numComponent++){
        let newNameWordSets = [];
        for (let someComponent of options[numComponent]){
            for (let lastComponent of nameWordSets){
                lastComponent = lastComponent.slice();
                lastComponent.push(...someComponent);
                newNameWordSets.push(lastComponent.slice());
                lastComponent = []
            }
        }
        nameWordSets = newNameWordSets.slice();
        newNameWordSets = [];
    }
    return nameWordSets;
}
  

async function translate(name){
    try {
        // return name;
        return (await(await fetch(googleTranslateURL('auto', 'en', name))).json())[0][0][0].toLowerCase();
    } catch (e){
        return name;
    }
}

// Создаем вариации слова
async function wordToOptions(name){
    const options = [];
    options.push([await translate(name)]);
    options.push([name]);
    for (let option of Transliteration(name)){
        if (!options.map(opt => opt[0]).includes(option)) options.push([option]);
    }
    if (name.length <= 3){
        let abbreviations = [[]];
        for (let charVariations of name.split('').map(ch => dictionary[ch] || [ch])){
            const newAbbreviations = [];
            for (let abbreviationSymbol of abbreviations){
                const bufferAbbreviations = abbreviationSymbol.slice();
                for (let charVariation of charVariations){
                    const copyBufferAbbreviations = bufferAbbreviations.slice();
                    copyBufferAbbreviations.push(charVariation);
                    newAbbreviations.push(copyBufferAbbreviations)
                }
            
            }
        abbreviations = newAbbreviations.slice();
        }
        options.push(...abbreviations);
    }
    return options;
}

function getLongestWordSetCombinations(nameWordSet, minimumSetLength){
    let longestWordSetCombinations = [[]];
    for (let numWordInWordSet=0;numWordInWordSet<minimumSetLength;numWordInWordSet++){
        let lastLongestWordSetCombinations = [];
        for (let word of nameWordSet){
            for (let longestWordSetCombination of longestWordSetCombinations){
                longestWordSetCombination = longestWordSetCombination.slice();
                if (!longestWordSetCombination.includes(word)){
                    longestWordSetCombination.push(word);
                    lastLongestWordSetCombinations.push(longestWordSetCombination.slice());
                    longestWordSetCombination = [];
                }
                
            }
        }
        longestWordSetCombinations = lastLongestWordSetCombinations.slice();
        lastLongestWordSetCombinations = [];
    }
    return longestWordSetCombinations;
}
  

function getSameWordsCount(set1Words, set2Words){
    let sameWordsCount = 0;
    let wordsMatched = false;
    let wordNotExist = true;
    for (let numWord=0;numWord<set1Words.length;numWord++){
        if (set1Words[numWord] === set2Words[numWord] || 
            set1Words[numWord].startsWith(set2Words[numWord]) || 
            set2Words[numWord].startsWith(set1Words[numWord])) 
            {
                sameWordsCount++;
                if (set1Words[numWord] === set2Words[numWord] && set1Words[numWord].length >= 3 && set2Words[numWord].length >= 3){
                    wordsMatched = true;
                }
                if (set1Words[numWord].length >= 3 || set2Words[numWord].length >= 3){
                    wordNotExist = false;
                }
            }
    }
    if (wordsMatched || wordNotExist) return sameWordsCount / set1Words.length;
    return 0;
}

function pairWithTheBestSimilarity(arr){
    let pair = {set1Words: [], set2Words: [], sameWordsCount: 0};
    for (let obj of arr){
        if (obj.sameWordsCount === 1) return lodash.cloneDeep(obj);
        if (obj.sameWordsCount >= pair.sameWordsCount){
            pair = lodash.cloneDeep(obj);
        }
    }
    return pair;
}

function searchWordsThatMatch(name1WordOption, name2WordOption){
    for (let word1 of name1WordOption){
        for (let word2 of name2WordOption){
            if (word1 === word2 || word1.startsWith(word2) || word2.startsWith(word1)){
                    return {word1: word1, word2: word2, matched: true};
                }
        }
    }
    return {word1: '', word2: '', matched: false};
}

function findingBestSimilarity(name1Options, name2Options){
    [name1Options, name2Options] = [name1Options.slice(), name2Options.slice()];
    const pairsWithTheBestSimilarity = [];
    let sameWordsCount = 0;
    let minimumSetLength = Math.min(name1Options.length, name2Options.length)
    let maximumSetLength = Math.max(name1Options.length, name2Options.length)
    if (name2Options.length === minimumSetLength){
        [name1Options, name2Options] = [name2Options, name1Options];
    }
    const namesSets = {
        name1Set: Array(minimumSetLength).fill(''),
        name2Set: Array(minimumSetLength).fill(''),
    }
    for (let numName1Options=0;numName1Options<name1Options.length;numName1Options++){
        const name1WordOptions = name1Options[numName1Options];
        for (let numName2Options=0;numName2Options<name2Options.length;numName2Options++){
            const name2WordOptions = name2Options[numName2Options];
            if (namesSets.name1Set[numName1Options] || namesSets.name2Set[numName1Options]) break;
            for (let name1WordOption of name1WordOptions){
                if (namesSets.name1Set[numName1Options] || namesSets.name2Set[numName1Options]) break;
                for (let name2WordOption of name2WordOptions){
                    if (namesSets.name1Set[numName1Options] || namesSets.name2Set[numName1Options]) break;
                    const wordsThatMatched = searchWordsThatMatch(name1WordOption, name2WordOption);
                    if (wordsThatMatched.matched){
                        sameWordsCount++;
                        namesSets.name1Set[numName1Options] = wordsThatMatched.word1;
                        namesSets.name2Set[numName1Options] = wordsThatMatched.word2;
                        name2Options.splice(numName2Options, 1);;
                        break;
                    }
                }
                
            } 
        }
        if (!namesSets.name1Set[numName1Options]){
            namesSets.name1Set[numName1Options] = name1WordOptions?.[0]?.[0];
            namesSets.name2Set[numName1Options] = name2Options[numName1Options]?.[0]?.[0];
        }
        
    }
    let fullWordExist = false;
    let fullWordMatched = false;
    for (let numWord=0;numWord<namesSets.name1Set.length;numWord++){
        if (namesSets.name1Set[numWord]?.length >= 3 || namesSets.name2Set[numWord]?.length >= 3) fullWordExist = true;
        if (namesSets.name1Set[numWord]?.length >= 3 && namesSets.name2Set[numWord]?.length >= 3 && 
            (namesSets.name1Set[numWord].startsWith(namesSets.name2Set[numWord]) || namesSets.name2Set[numWord].startsWith(namesSets.name1Set[numWord]))  ) fullWordMatched = true;
        namesSets.name1Set[numWord], namesSets.name2Set[numWord]
    }
    // console.log(namesSets.name1Set, namesSets.name2Set, fullWordMatched, fullWordExist)
    let sameWordsProcent = fullWordMatched || !fullWordExist ? sameWordsCount / namesSets.name2Set.length : 0
    return {name1Set: namesSets.name1Set, name2Set: namesSets.name2Set, sameWordsCount: sameWordsProcent};
}

async function getGameObjectSetsForSimilarity(games, game){
    games[game].name1 = ' ' + games[game].name1.toLowerCase() + ' ';
    games[game].name2 = ' ' + games[game].name2.toLowerCase() + ' ';

    games[game].name1 = clearingName(games[game].name1, games[game].bookieKey);
    games[game].name2 = clearingName(games[game].name2, games[game].bookieKey);

    games[game].name1Words = games[game].name1.match(/[\p{Letter}\p{Mark}\p{Number}]+/ug) || [];
    games[game].name2Words = games[game].name2.match(/[\p{Letter}\p{Mark}\p{Number}]+/ug) || [];

    [games[game].name1Options, games[game].name2Options] = await Promise.all([
        Promise.all(games[game].name1Words.map(word => wordToOptions(word))),
        Promise.all(games[game].name2Words.map(word => wordToOptions(word)))
    ]);

    delete games[game].name1Words;
    delete games[game].name2Words;

    return games[game];
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
    return [similarityNames, Math.max(
        (similarityNames.game1Name1game2Name1.sameWordsCount + similarityNames.game1Name2game2Name2.sameWordsCount) / 2,
        (similarityNames.game1Name1game2Name2.sameWordsCount + similarityNames.game1Name2game2Name1.sameWordsCount) / 2,
    )];
}


// main();

// _____________________Example_______________


const example = async () => {
    t = new Date();
    let games = {"game1":{"name1":"CSM Sighisoara","name2":"Constanta","bookieKey":"FONBET"},"game2":{"name1":"CSM Sighisoara","name2":"CSM Constanta","bookieKey":"BET365"}}
    games.game1 = await getGameObjectSetsForSimilarity(games, 'game1');
    games.game2 = await getGameObjectSetsForSimilarity(games, 'game2');
    console.log((await getSimilarityNames(games))[0]);
    console.log(new Date() - t);
};


example();
module.exports = { getSimilarityNames, getGameObjectSetsForSimilarity, findingBestSimilarity };