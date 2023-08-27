const { copyFileSync, cpSync } = require('fs');
const lodash = require('lodash');
const { devNull } = require('os');

const minimumCharCount = 4;
const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const dictionary = {
    'а': ['a', 'o', 'u'], 
    'б': ['b'], 
    'в': ['v', 'w'], 
    'г': ['g', 'h'], 
    'д': ['d', 't'], 
    'е': ['e', 'y', 'i', 'j', 'a', 'ie', 'ye', 'io', 'je'], 
    'ё': ['y', 'i', 'o', 'io', 'yo', 'jo'],
    'ж': ['z', 'j', 'g'], 
    'з': ['z', 't', 's', 'e'], 
    'и': ['i', 'e', 'y', 'j', 'ee', 'ij', 'ji'],
    'й': ['i', 'y', 'j'], 
    'к': ['k', 'c', 'q', 'h', 'ck'], 
    'л': ['l', 'll', 'gl'],
    'м': ['m', ''], 
    'н': ['n', 'm', 'o', 'ng'],
    'о': ['o', 'a', 'e'], 
    'п': ['p'], 
    'р': ['r'], 
    'с': ['s', 'c', 'z', 'ts', 'x'], 
    'т': ['t', 'c', 'th'],
    'у': ['u', 'o', 'w', 'oo'], 
    'ф': ['f'], 
    'х': ['h', 'k', 'j', 'ch', 'kh'],
    'ц': ['c', 't', 's'], 
    'ч': ['c', 'z', 'j', 'ch', 'cz'], 
    'ш': ['s', 'h', 'c', 'sh', 'sz'],
    'щ': ['s', 'h', 'c', 'szcz'], 
    'ъ': [''], 
    'ы': ['y', 's', 'a'], 
    'ь': ['', 'i', 'y'], 
    'э': ['e', 'ye', 'a', 'o'],
    'ю': ['u', 'i', 'y', 'w', 'iu', 'yu'], 
    'я': ['j', 'a', 'i', 'ia', 'ya', 'y', 'ja'],

    'ай': ['ai', 'ay'],
    'ий': ['y', 'ei', 'ey'],
    'дж': ['dj', 'dg'],
    'дз': ['dz'],
    'ей': ['ey'],
    'из': ['iz'],
    'бр': ['br'],
    'кх': ['kh'],
    'цз': ['ji'],
    'жа': ['a'],
    // other words
    'a': ['a', 'e', 'ey'],
    'ö': ['o'],
    'ü': ['u'],
    'y': ['y', 'i'],
    'c': ['c', 's'],
    's': ['s', 'c'],
    'i': ['y', 'e', 'i'],
    'II': ['2', ],
    'ie': ['ie', 'ye'],
    'ch': ['ch'],
    'br': ['br'],
    'e': ['e', 'a'],
    'ai': ['ai'],
    'ay': ['ay'],
    'ä': ['a'],
    'ia': ['ia'],
    'gl': ['gl'],
    'io': ['io'],
    'kh': ['kh'],
    'ye': ['ye', 'ie'],
    'ts': ['ts'],
    'ya': ['ya'],
    'yu': ['yu'],
    'iu': ['iu'],
    'ge': ['ge'],
    'th': ['th', 't'],
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
    'ja': ['ja'],
    'cz': ['cz'],
    'sz': ['sz'],
    'sh': ['sh'],
    'szcz': ['szcz']

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
    `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&q=${encodeURIComponent(txt)}`

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
    return {options: options, lengthWord: word.length};
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
    let result = {word: '', matched: false, countChars: 0};

    function allVariationword(countChars, word, localName1WordOption, localName2WordOption){
        let name1WordOptionCharsObjectKeys = Object.keys(localName1WordOption);
        let name2WordOptionCharsObjectKeys = Object.keys(localName2WordOption);
        if (name1WordOptionCharsObjectKeys.length === 0 || name2WordOptionCharsObjectKeys.length === 0){
            result = {word: word, matched: true, countChars: countChars};
            return;
        }
        for (let name1OptionChar of name1WordOptionCharsObjectKeys){
            for (let name2OptionChar of name2WordOptionCharsObjectKeys){
                if (name1OptionChar === name2OptionChar){
                    allVariationword(countChars + 1, word + name1OptionChar, localName1WordOption[name1OptionChar], localName2WordOption[name2OptionChar]);
                    break;
                }
            }
        }
        
        if (result.word === '') {
            result = {word: word, matched: false, countChars: countChars};
        }
        return;
    }
    allVariationword(0, '', name1WordOption, name2WordOption);
    return result;
}

function findingBestSimilarity(name1Options, name2Options){
    const namesSets = {
        countChars: name1Options.map(obj => obj.lengthWord).slice()
    };
    [name1Options, name2Options] = [name1Options.map(obj => obj.options).slice(), name2Options.map(obj => obj.options).slice()];
    const pairsWithTheBestSimilarity = [];
    let sameWordsCount = 0;
    let minimumSetLength = Math.min(name1Options.length, name2Options.length);
    let maximumSetLength = Math.max(name1Options.length, name2Options.length);
    if (name2Options.length === minimumSetLength){
        [name1Options, name2Options] = [name2Options, name1Options];
    }
    namesSets.name1Set = Array(minimumSetLength).fill('!');
    namesSets.name2Set = Array(minimumSetLength).fill('!');
    for (let numName1Options=0;numName1Options<name1Options.length;numName1Options++){
        const name1WordOptions = name1Options[numName1Options];
        for (let numName2Options=0;numName2Options<name2Options.length;numName2Options++){
            const name2WordOptions = name2Options[numName2Options];
            for (let name1WordOption of name1WordOptions){
                for (let name2WordOption of name2WordOptions){
                    const wordsThatMatched = searchWordsThatMatch(name1WordOption, name2WordOption);
                    if (wordsThatMatched.matched){
                        if (namesSets.name1Set[numName1Options] === '!') sameWordsCount++;
                        if (namesSets.name1Set[numName1Options] === '!' || namesSets.name1Set[numName1Options].length < wordsThatMatched.word.length){
                            namesSets.name1Set[numName1Options] = wordsThatMatched.word;
                            namesSets.name2Set[numName1Options] = wordsThatMatched.word;
                            namesSets.countChars[numName1Options] = wordsThatMatched.countChars;
                            
                        }
                        break;   
                    } else {

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
    let fullWordMatched = false;
    for (let numWord=0;numWord<namesSets.name1Set.length;numWord++){
        if (namesSets.countChars[numWord] >= minimumCharCount) fullWordExist = true;
        if (namesSets.countChars[numWord] >= minimumCharCount && namesSets.name1Set[numWord] !== '!') fullWordMatched = true;
    }
    // console.log(namesSets.name1Set, namesSets.name2Set, fullWordMatched, fullWordExist)
    let sameWordsProcent = !fullWordExist || fullWordMatched? sameWordsCount / namesSets.name2Set.length : 0;
    // if (sameWordsProcent > 0.5) console.log('!!!!!!!!!!!!!!!!!!!!!!', namesSets, sameWordsCount)
    return {namesSet: namesSets.name1Set, countChars: namesSets.countChars, sameWordsCount: sameWordsProcent};
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
    let games = {"game1":{"name1":"Luis Meneses","name2":"Bhavesh Shah","bookieKey":"BETRADAR"},"game2":{"name1":"Meneses L","name2":"Shah B","bookieKey":"FONBET"}}
    games.game1 = await getGameObjectSetsForSimilarity(games, 'game1');
    games.game2 = await getGameObjectSetsForSimilarity(games, 'game2');
    (await getSimilarityNames(games)).map(val => console.log(val));
    console.log(new Date() - t);
};


example();
// console.log(Transliteration('meneses '))
module.exports = { getSimilarityNames, getGameObjectSetsForSimilarity, findingBestSimilarity };