const { copyFileSync } = require('fs');
const lodash = require('lodash');
const { devNull } = require('os');

const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const dictionary = {
    'а': ['a', 'o', 'u', 'ah'], 
    'б': ['b'], 
    'в': ['v', 'w'], 
    'г': ['g', 'h'], 
    'д': ['d', 't', 'th'], 
    'е': ['e', 'ye', 'ie', 'y', 'je', 'a', 'et', 'je'], 
    'ё': ['yo', 'io', 'o'],
    'ж': ['zh', 'j', 'g'], 
    'з': ['z', 'th', 's'], 
    'и': ['i', 'e', 'y', 'ii', 'ie', 'ea', 'ji', 'ee'],
    'й': ['i', 'y', 'j'], 
    'к': ['k', 'c', 'kh', 'qu'], 
    'л': ['l'],
    'м': ['m', ''], 
    'н': ['n', 'm', 'ng', 'o'],
    'о': ['o', 'a', 'ou', 'au', 'e'], 
    'п': ['p'], 
    'р': ['r'], 
    'с': ['s', 'c', 'sz', 'z'], 
    'т': ['t', 'ch', 'tt'], 
    'у': ['u', 'oo', 'o', 'w', 'ou'], 
    'ф': ['f', 'ph'], 
    'х': ['h', 'ch', 'kh', 'j'],
    'ц': ['c', 'ts'], 
    'ч': ['ch', 'c', 'cz', 'j', 'zsch'], 
    'ш': ['sh', 'sz', 's', 'sc', 'ch'],
    'щ': ['sch', 'shch', 'sh', 'ch', 'szcz'], 
    'ъ': [''], 
    'ы': ['y', 's', 'a'], 
    'ь': [''], 
    'э': ['e', 'ye', 'a', 'aeu', 'o'],
    'ю': ['u', 'iu', 'yu', 'y', 'yu', 'ew'], 
    'я': ['ya', 'ia', 'j', 'a', 'ja'],
    'ай': ['i'],
    'ий': ['y'],
    'дж': ['jo', 'g', 'j', 'gu'],
    'дз': ['z'],
    // other words
    'ö': ['o'],
    'y': ['y', 'i'],
    'c': ['c', 's'],
    's': ['s', 'c'],
    'h': ['h'],
    'e': ['e'],
    'i': ['y', 'e'],
    'II': ['2', ],
    'ie': ['i', 'e'],
}

for (key in dictionary){
    for (let charNum=0;charNum<dictionary[key].length;charNum++){
        if (dictionary[key][charNum].length > 1){
            dictionary[dictionary[key][charNum]] = [dictionary[key][charNum][0]];
            dictionary[key][charNum] = dictionary[key][charNum][0];
        }
    }
    dictionary[key] = Array.from(new Set(dictionary[key]));
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
    let words = {};
    const maxWordLength = word.length;

    function backtrack(currentWord, index, wood) {
        // console.log(wood);
        // console.log(999, wood, currentWord)
        wood[currentWord] = {};
        if (index === maxWordLength){
            return;
        }
        
        // console.log(wood, currentWord, index, maxWordLength);
        let sequenceCharacters = word[index]
        const currentSymbolsTranslations = (dictionary[word[index]] || [word[index]]).map(char => {return {str: char, ind: index}});
        for (let sequenceCharacterNumber=index+1;sequenceCharacterNumber<
            index+maximumLengthKeySlovet;sequenceCharacterNumber++){
                if (!word[sequenceCharacterNumber]) break;
            sequenceCharacters += word[sequenceCharacterNumber];
            if (dictionary[sequenceCharacters]){
                currentSymbolsTranslations.push(...(dictionary[word[sequenceCharacterNumber]] || [word[sequenceCharacterNumber]]).map(char => {return {str: char, ind: index}}))
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

async function wordToOption(word){
    const options = [];
    options.push(Transliteration(word));
    options.push(Transliteration(await translate(word)));
    if (word.length <= 4){
        for (let char of word){
            options.push(Transliteration(char));
        }
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
    let name1WordOptionCharsObjectKeys = Object.keys(name1WordOption);
    let name2WordOptionCharsObjectKeys = Object.keys(name2WordOption);
    let word = '';
    
    while (name1WordOptionCharsObjectKeys.length && name2WordOptionCharsObjectKeys.length){
        let matched = false;
        for (let char of name1WordOptionCharsObjectKeys){
            if (name2WordOptionCharsObjectKeys.includes(char) || char === ''){
                word += char;
                name1WordOption = name1WordOption[char];
                if (char) name2WordOption = name2WordOption[char];
                name1WordOptionCharsObjectKeys = Object.keys(name1WordOption);
                name2WordOptionCharsObjectKeys = Object.keys(name2WordOption);
                matched = true;
                break;
            }
        }
        if (!matched){
            return {word: word, matched: matched};
        }
    }
    return {word: word, matched: true};
}

function findingBestSimilarity(name1Options, name2Options){
    [name1Options, name2Options] = [name1Options.slice(), name2Options.slice()];
    const pairsWithTheBestSimilarity = [];
    let sameWordsCount = 0;
    let minimumSetLength = Math.min(name1Options.length, name2Options.length);
    let maximumSetLength = Math.max(name1Options.length, name2Options.length);
    if (name2Options.length === minimumSetLength){
        [name1Options, name2Options] = [name2Options, name1Options];
    }
    const namesSets = {
        name1Set: Array(minimumSetLength).fill('!'),
        name2Set: Array(minimumSetLength).fill('!'),
    }
    for (let numName1Options=0;numName1Options<name1Options.length;numName1Options++){
        const name1WordOptions = name1Options[numName1Options];
        for (let numName2Options=0;numName2Options<name2Options.length;numName2Options++){
            const name2WordOptions = name2Options[numName2Options];
            if (namesSets.name1Set[numName1Options].length >= 3) break;
            for (let name1WordOption of name1WordOptions){
                if (namesSets.name1Set[numName1Options].length >= 3) break;
                for (let name2WordOption of name2WordOptions){
                    if (namesSets.name1Set[numName1Options].length >= 3) break;
                    const wordsThatMatched = searchWordsThatMatch(name1WordOption, name2WordOption);
                    if (wordsThatMatched.matched){
                        if (namesSets.name1Set[numName1Options] === '!' && namesSets.name2Set[numName1Options] === '!') sameWordsCount++;
                        namesSets.name1Set[numName1Options] = wordsThatMatched.word;
                        namesSets.name2Set[numName1Options] = wordsThatMatched.word;
                        break;
                    }
                }
                
            } 
        }
        // if (!namesSets.name1Set[numName1Options]){
        //     namesSets.name1Set[numName1Options] = name1WordOptions?.[0]?.[0];
        //     namesSets.name2Set[numName1Options] = name2Options[numName1Options]?.[0]?.[0];
        // }
        
    }
    let fullWordExist = false;
    for (let numWord=0;numWord<namesSets.name1Set.length;numWord++){
        if (namesSets.name1Set[numWord]?.length >= 3) fullWordExist = true;
    }
    // console.log(namesSets.name1Set, namesSets.name2Set, fullWordMatched, fullWordExist)
    let sameWordsProcent = namesSets.name2Set.length && fullWordExist ? sameWordsCount / namesSets.name2Set.length : 0;
    // if (sameWordsProcent > 0.5) console.log('!!!!!!!!!!!!!!!!!!!!!!', namesSets, sameWordsCount)
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
        Promise.all(games[game].name1Words.map(word => wordToOption(word))),
        Promise.all(games[game].name2Words.map(word => wordToOption(word)))
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
    let games = {"game1":{"name1":"VPS Vaasa","name2":"KTP Kotka","bookieKey":"FONBET"},"game2":{"name1":"Аль-Фейха","name2":"Аль-Хазм","bookieKey":"OLIMP"}}
    games.game1 = await getGameObjectSetsForSimilarity(games, 'game1');
    games.game2 = await getGameObjectSetsForSimilarity(games, 'game2');
    (await getSimilarityNames(games)).map(val => console.log(val));
    console.log(new Date() - t);
};


example();
// console.log(Transliteration('zaglebie')['z']['a']['g']['l']['e'], Transliteration('заглембе ')['z']['a']['g']['l']['e'])
module.exports = { getSimilarityNames, getGameObjectSetsForSimilarity, findingBestSimilarity };