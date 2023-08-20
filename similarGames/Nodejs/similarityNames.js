const lodash = require('lodash');

const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const slolet = {
    'а': ['a', 'o'], 
    'б': ['b'], 
    'в': ['v', 'w'], 
    'г': ['g', 'h'], 
    'д': ['d', 't', 'th'], 
    'е': ['e', 'ye', 'ie', 'y'], 
    'ё': ['yo', 'io', 'o'],
    'ж': ['zh', 'j', 'g'], 
    'з': ['z', 'th'], 
    'и': ['i', 'e', 'y', 'ii', 'ie', 'ea'],
    'й': ['i', 'y', 'j'], 
    'к': ['k', 'c', 'kh'], 
    'л': ['l'], 
    'м': ['m'], 
    'н': ['n', 'm'],
    'о': ['o', 'oe'], 
    'п': ['p'], 
    'р': ['r'], 
    'с': ['s', 'c', 'sz', 'z'], 
    'т': ['t', 'ch'], 
    'у': ['u', 'oo', 'o'], 
    'ф': ['f', 'ph'], 
    'х': ['h', 'ch', 'kh'],
    'ц': ['c', 'ts'], 
    'ч': ['ch', 'c', 'cz'], 
    'ш': ['sh', 'sz'], 
    'щ': ['sch', 'shch', 'sh', 'ch', 'szcz'], 
    'ъ': [''], 
    'ы': ['y', 's', 'a'], 
    'ь': [''], 
    'э': ['e', 'ie', 'ye'],
    'ю': ['u', 'iu', 'yu'], 
    'я': ['ya', 'ia', 'j', 'ya', 'a'],
    'y': ['y', 'i'],
    'II': ['2', ],
    'III': ['3', ]
}

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
    let words = ['']; 
    for (let indChar = 0; indChar < word.length; indChar++) {
      const currentSymbolsTranslations = slolet[word[indChar]] || [word[indChar]];
      let newWords = [];
      for (let symbol of currentSymbolsTranslations) {
        for (let existingWord of words) {
          newWords.push(existingWord + symbol);
        }
      }
      words = [];
      words = newWords.slice();
      newWords = [];
    }
  
    return words;
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
        console.log(e);
        return name;
    }
}

// Создаем вариации слова
async function wordToOptions(name){
    const options = [];
    options.push([await translate(name)]);
    for (let option of Transliteration(name)){
        if (options[0][0] !== option) options.push([option]);
    }
    if (name.length <= 3){
        options.push(name.split(''));
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

function findingBestSimilarity(name1WordSets, name2WordSets){
    const pairsWithTheBestSimilarity = [];

    for (let name1WordSet of name1WordSets){
        for (let name2WordSet of name2WordSets){
            const minimumSetLength = Math.min(name1WordSet.length, name2WordSet.length);
            let staticSet = null;
            let setCombinations = null;
            if (name1WordSet.length <= name2WordSet.length){
                staticSet = name1WordSet;
                setCombinations = name2WordSet;
            } else {
                staticSet = name2WordSet;
                setCombinations = name1WordSet;
            }

            const longestWordSetCombinations = getLongestWordSetCombinations(setCombinations, minimumSetLength);
            const nameWordSetPairs = longestWordSetCombinations.map(set => {return {set1Words: set, set2Words: staticSet, sameWordsCount: getSameWordsCount(set, staticSet)}});

            pairsWithTheBestSimilarity.push(pairWithTheBestSimilarity(nameWordSetPairs));
        }
    }
    return pairWithTheBestSimilarity(pairsWithTheBestSimilarity);
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

    games[game].name1WordSets = createSets(games[game].name1Options);
    games[game].name2WordSets = createSets(games[game].name2Options);


    delete games[game].name1Options;
    delete games[game].name2Options;

    return games[game];
}


async function similarityNames(games){
    const similarityNames = {
        game1Name1game2Name1: findingBestSimilarity(games.game1.name1WordSets, games.game2.name1WordSets),
        game1Name2game2Name2: findingBestSimilarity(games.game1.name2WordSets, games.game2.name2WordSets),
        game1Name1game2Name2: findingBestSimilarity(games.game1.name1WordSets, games.game2.name2WordSets),
        game1Name2game2Name1: findingBestSimilarity(games.game1.name2WordSets, games.game2.name1WordSets),
    }
    // delete games.game1.name1WordSets;
    // delete games.game1.name2WordSets;
    delete games.game2.name1WordSets;
    delete games.game2.name2WordSets;

    return [similarityNames, Math.max(
        (similarityNames.game1Name1game2Name1.sameWordsCount + similarityNames.game1Name2game2Name2.sameWordsCount) / 2,
        (similarityNames.game1Name1game2Name2.sameWordsCount + similarityNames.game1Name2game2Name1.sameWordsCount) / 2,
    )]
}


// main();

// _____________________Example_______________


const example = async () => {
    t = new Date();
    const games = {
        game1: {
            name1: 'Poland',
            name2: 'Slovenia',
            bookieKey: 'BET365',
        },
        game2: {
            name1: 'Польша',
            name2: 'Словения',
            bookieKey: 'OLIMP'
        }
    }
    games.game1 = await getGameObjectSetsForSimilarity(games, 'game1');
    games.game2 = await getGameObjectSetsForSimilarity(games, 'game2');
    console.log(await similarityNames(games));
    console.log(games);
    console.log(new Date() - t);
};


// example();
module.exports = { similarityNames, getGameObjectSetsForSimilarity };