const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const slovar = {
    'а': ['a', 'o'], 
    'б': ['b'], 
    'в': ['v', 'w', 'f', 'ph'], 
    'г': ['g', 'h'], 
    'д': ['d', 't', 'th'], 
    'е': ['e', 'ye', 'ie'], 
    'ё': ['yo', 'io', 'o'],
    'ж': ['zh', 'j', 'g'], 
    'з': ['z', 'th'], 
    'и': ['i', 'e', 'y', 'ii', 'ie'],
    'й': ['i', 'y', 'j'], 
    'к': ['k', 'c'], 
    'л': ['l'], 
    'м': ['m'], 
    'н': ['n'],
    'о': ['o'], 
    'п': ['p'], 
    'р': ['r'], 
    'с': ['s', 'c', 'sz', 'z'], 
    'т': ['t'], 
    'у': ['u'], 
    'ф': ['f', 'ph'], 
    'х': ['h', 'ch'],
    'ц': ['c'], 
    'ч': ['ch', 'c'], 
    'ш': ['sh', 'sz'], 
    'щ': ['sch'], 
    'ъ': [''], 
    'ы': ['y', 's'], 
    'ь': [''], 
    'э': ['e', 'ie', 'ye'],
    'ю': ['u', 'iu', 'yu'], 
    'я': ['ya', 'ia', 'j', 'ya'],
    'y': ['y', 'i', 'oo']
}

const unimportantComponents = [
    '-', ',', ':', '*', '/', '|',
    '[', ']', '(', ')', ' жен ', ' w ', ' FC ', ' women ', ' esports ', ' м ', ' m ', ' до ', 
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ECF ', ' SC ', ' university ', ' U ',
    ' univ ', ' университет ', ' унив ', ' FK ', ' team ', ' reserves ', ' CF ', '.'
]

function capitalizeFirstLetter(string) {
    return string[0] + string.charAt(1).toUpperCase() + string.slice(2);
}

const googleTranslateURL = (from, to, txt) =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${from}&tl=${to}&q=${txt}`;


function clearingName(name){
    for (let component of unimportantComponents){
        name = name.replace(component, ' ');
        name = name.replace(capitalizeFirstLetter(component), ' ');
    }
    name = name.replace('  ', ' ');
    return name;
}

function Transliteration(name){
    var newNames = [''];
    for (let indChar = 0; indChar < name.length; indChar++) {
        if (slovar[name[indChar].toLowerCase()]){
            if (name[indChar].toLowerCase() === name[indChar]){
                const newNames1 = [];
                for (let symbol of slovar[name[indChar]]){
                    for (let word of newNames){
                        newNames1.push(word + symbol);
                    }
                }
                newNames = newNames1;
            } else {
                const newNames1 = [];
                for (let symbol of slovar[name[indChar].toLowerCase()]){
                    for (let word of newNames){
                        newNames1.push(word + capitalizeFirstLetter(' ' + symbol).slice(1));
                    }
                }
                newNames = newNames1;
            }
            
        } else {
            const newNames1 = [];
            for (let word of newNames){
                newNames1.push(word + name[indChar]);
            }
            newNames = newNames1;
        }
    }
    return newNames;
}

function createSets(options){
    var nameWordSets = options[0].slice();
    for (let numComponent=1;numComponent<options.length;numComponent++){
        const newNameWordSets = [];
        for (let someComponent of options[numComponent]){
            for (let lastComponent of nameWordSets){
                lastComponent = lastComponent.slice();
                lastComponent.push(...someComponent);
                newNameWordSets.push(lastComponent);
            }
        }
        nameWordSets = newNameWordSets.slice();
    }

    return nameWordSets;
}

async function translate(name){
    try {
        return (await(await fetch(googleTranslateURL('auto', 'en', name))).json())[0][0][0];
    } catch (e){
        console.log(e);
        return name;
    }
}

// Создаем вариации слова
async function wordToOptions(name){
    const options = [];
    options.push([name]);
    for (let option of Transliteration(name)) options.push([option]);
    options.push([await translate(name)]);
    // if (name.length <= 4){
    //     options.push(name.split(''));
    // }

    const setArray = new Set(options.map(x => JSON.stringify(x)))
    const uniqArray = [...setArray].map(x => JSON.parse(x))
    return uniqArray;
}

function getLongestWordSetCombinations(nameWordSet, minimumSetLength){
    var longestWordSetCombinations = [[]];
    for (let numWordInWordSet=0;numWordInWordSet<minimumSetLength;numWordInWordSet++){
        const longestWordSetCombinations1 = [];
        for (let word of nameWordSet){
            for (let longestWordSetCombination of longestWordSetCombinations){
                longestWordSetCombination = longestWordSetCombination.slice();
                if (!longestWordSetCombination.includes(word)){
                    longestWordSetCombination.push(word);
                    longestWordSetCombinations1.push(longestWordSetCombination);
                }
                
            }
        }
        longestWordSetCombinations = longestWordSetCombinations1;
    }
    return longestWordSetCombinations;
}

function getSameWordsCount(set1Words, set2Words){
    var sameWordsCount = 0;
    for (let numWord=0;numWord<set1Words.length;numWord++){
        if (set1Words[numWord].toLowerCase() === set2Words[numWord].toLowerCase() || 
            set1Words[numWord].toLowerCase().startsWith(set2Words[numWord].toLowerCase()) || 
            set2Words[numWord].toLowerCase().startsWith(set1Words[numWord].toLowerCase())) sameWordsCount++;
    }
    return sameWordsCount / set1Words.length;
}

function pairWithTheBestSimilarity(arr){
    var pair = {set1Words: [], set2Words: [], sameWordsCount: 0};
    for (let obj of arr){
        if (obj.sameWordsCount >= pair.sameWordsCount){
            pair = JSON.parse(JSON.stringify(obj));

        }
    }
    return pair;
}

async function similarityNames(name1, name2){
    name1 = ' ' + name1 + ' ';
    name2 = ' ' + name2 + ' ';
    name1 = clearingName(name1);
    name2 = clearingName(name2);

    const name1Words = name1.split(' ').filter(word => word.length > 0);
    const name2Words = name2.split(' ').filter(word => word.length > 0);

    const name1Options = await Promise.all(name1Words.map(async word => await wordToOptions(word)));
    const name2Options = await Promise.all(name2Words.map(async word => await wordToOptions(word)));

    const name1WordSets = createSets(name1Options);
    const name2WordSets = createSets(name2Options);

    const pairsWithTheBestSimilarity = [];

    for (let name1WordSet of name1WordSets){
        for (let name2WordSet of name2WordSets){
            const minimumSetLength = Math.min(name1WordSet.length, name2WordSet.length);
            var staticSet = null;
            var setCombinations = null;
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

async function forecast(count, name, lengthArr){
    const results = {
        'n1+n2': await similarityNames(name.n1, name.n2),
        'n3+n4': await similarityNames(name.n3, name.n4),
        'n1+n4': await similarityNames(name.n1, name.n4),
        'n2+n3': await similarityNames(name.n2, name.n3),
    };
    console.log(count, '/', lengthArr);
    if (Math.max(
        (results['n1+n2'].sameWordsCount + results['n3+n4'].sameWordsCount) / 2, 
        (results['n1+n4'].sameWordsCount + results['n2+n3'].sameWordsCount) / 2) > 0.75){
        console.log(name, results);
    }
}


async function main(){
    const knex = require('knex');
    const config = require('./knexfile');
    const db = knex(config.development);
    const names = await db('pairs').select('game1Team1Name as n1', 'game2Team1Name as n2', 'game1Team2Name as n3', 'game2Team2Name as n4')
    .where('grouped', false).where('needGroup', false).limit(1000);
    console.log(names.length);
    var count = 0;
    for (let name of names){
        await forecast(count, JSON.parse(JSON.stringify(name)), names.length);
        
        count++;
        // if (!(await compareNames(n1, n2)) && !(await compareNames(n3, n4)) && !(await compareNames(n1, n4)) && !(await compareNames(n2, n3))){
        //     console.log('Не объединил!', count1, name);
        //     count1++;
        // }
    }
}

// main();

// _____________________Example_______________


// const example = async () => console.log(await similarityNames('Атлантик Греция Целтис (w)', 'Greece ATL Women'));
// example();

module.exports = similarityNames;