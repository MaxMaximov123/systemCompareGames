const russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

const slovar = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h',
    'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e',
    'ю': 'u', 'я': 'ya', 'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'YO',
    'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'I', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
    'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H',
    'Ц': 'C', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH', 'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'E',
    'Ю': 'U', 'Я': 'YA'
}

const googleTranslateURL = (from, to, txt) =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${from}&tl=${to}&q=${txt}`;


async function convertRuToEu(n, t){
    n = n.replace('(', ' ');
    n = n.replace(')', ' ');
    n = n.replace('women', 'w')
    n = n.replace('Women', 'w')
    if (russianAlphabet.includes(n[0].toLowerCase())) {
        n = n.replace(' ж ', 'w');
        n = n.replace(' м ', 'm');
        n = n.replace('до ', 'U');
        n = n.replace('Унив.', 'University')
        var newN = ''
        if (t){
            for (let indChar = 0; indChar < n.length; indChar++) {
                if (slovar[n[indChar]]){
                    newN += slovar[n[indChar]];
                } else {
                    newN += n[indChar];
                }
            }
            n = newN;
        } else {
            n = (await(await fetch(googleTranslateURL('ru', 'en', n))).json())[0][0][0];
        }
    }
    return n;
}

function searchComponent(n1, n2){
    for (let word of n1.split(' ')){
        if (word.includes('U') || word.length <= 3) continue;
        if (n2.includes(word)) return true;
    }
    return false;
}

function globalIncludes(n1, n2){
    // console.log(n1, n2)
    if (n1 === n2) return true;
    if (n1.includes(n2) || n2.includes(n1)) return true;
    if (searchComponent(n1, n2) || searchComponent(n2, n1)) return true;
    return false;
}

async function compareNames(n1, n2) {
    if (globalIncludes(n1, n2)) return true;

    if (globalIncludes(await convertRuToEu(n1, true), await convertRuToEu(n2, true))) return true;
    if (globalIncludes(await convertRuToEu(n1, false), await convertRuToEu(n2, false))) return true;

    n1 = n1.toLowerCase();
    n2 = n2.toLowerCase();
    if (globalIncludes(await convertRuToEu(n1, true), await convertRuToEu(n2, true))) return true;
    if (globalIncludes(await convertRuToEu(n1, false), await convertRuToEu(n2, false))) return true;


    return false;
}

const knex = require('knex');
const config = require('./knexfile');
const db = knex(config.development);

async function main(){
    const names = await db('pairs')
    .select('game1Team1Name as n1', 'game2Team1Name as n2', 'game1Team2Name as n3', 'game2Team2Name as n4', 'id')
    .where('needGroup', false).where('grouped', false)
    .orderBy('id', 'asc');
    const ct = names.length;
    let p = 0;
    for (let i of names){
        await db('pairs').where('id', i.id).update({ similarityNames: Number(await getRes(i.n1, i.n2, i.n3, i.n4))});
        console.log(i.id, p, '/', ct);
        p++;
    }
}


async function getRes(n1, n2, n3, n4){
    if ((await compareNames(n1, n2)) || (await compareNames(n3, n4)) || (await compareNames(n1, n4)) || (await compareNames(n2, n3))){
        return true;
    }
    return false;
    // const names = await db('pairs').select('game1Team1Name as n1', 'game2Team1Name as n2', 'game1Team2Name as n3', 'game2Team2Name as n4').where('grouped', true).orWhere('needGroup', true);
    // console.log(names.length);
    // var count1 = 0;
    // for (let name of names){
    //     if (!(await compareNames(n1, n2)) && !(await compareNames(n3, n4)) && !(await compareNames(n1, n4)) && !(await compareNames(n2, n3))){
    //         console.log('Не объединил!', count1, name);
    //         count1++;
    //     }
    // }

    // const names1 = await db('pairs').select('game1Team1Name as n1', 'game2Team1Name as n2', 'game1Team2Name as n3', 'game2Team2Name as n4').where('grouped', false).where('needGroup', false);
    // console.log(names1.length);
    // var count2 = 0;
    // for (let name of names1){
    //     if ((await compareNames(n1, n2)) || (await compareNames(n3, n4)) || (await compareNames(n1, n4)) || (await compareNames(n2, n3))){
    //         console.log('Объединил не верно!', count2, name);
    //         count2++;
    //     }
    // }
    // console.log('закончил!', count1, count2, names.length, names1.length);
}

module.exports = getRes;