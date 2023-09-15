const intersection = require('lodash/intersection.js');

// ----------------------------------------------------------------------

let replacements = {
    // Russian 1-character replacements

    'а': ['a', 'o', 'u'], 
    'б': ['b'], 
    'в': ['v', 'w'], 
    'г': ['g', 'h', 'q', 'gu', 'gh'],
    'д': ['d'],
    'е': ['e', 'y', 'i', 'j', 'a', 'ie', 'ye', 'io', 'je', 'ea', 'ae', 'eu'], 
    'ё': ['y', 'i', 'o', 'io', 'yo', 'jo'],
    'ж': ['z', 'j', 'g', 'zh', 'ge'], 
    'з': ['z', 't', 's', 'e'], 
    'и': ['i', 'e', 'y', 'j', 'ee', 'ij', 'ji', 'ea', 'yi', 'ie'],
    'й': ['i', 'y', 'j'], 
    'к': ['k', 'c', 'q', 'h', 'ck', 'sk'], 
    'л': ['l', 'll', 'gl'],
    'м': ['m'], 
    'н': ['n', 'm', 'ng', 'gn', 'hn'],
    'о': ['o', 'a', 'e', 'u', 'au', 'eau'], 
    'п': ['p'], 
    'р': ['r', 'rh'], 
    'с': ['s', 'c', 'z', 'ts', 'x', 'sz'],
    'т': ['t', 'c', 'th'],
    'у': ['u', 'o', 'w', 'oo', 'wu', 'ou', 'yu'], 
    'ф': ['f', 'v'], 
    'х': ['h', 'k', 'j', 'ch', 'kh'],
    'ц': ['c', 't', 's', 'z', 'ts'], 
    'ч': ['z', 'j', 'ch', 'cz'], 
    'ш': ['s', 'h', 'c', 'sh', 'sz', 'sch'],
    'щ': ['s', 'h', 'c', 'szcz'], 
    'ъ': [''], 
    'ы': ['y', 's', 'a'], 
    'ь': ['', 'i', 'y'],
    'э': ['e', 'ye', 'a', 'o'],
    'ю': ['u', 'i', 'y', 'w', 'iu', 'yu', 'ju', 'j'], 
    'я': ['j', 'a', 'i', 'ia', 'ya', 'y', 'ja'],

    // Russian 2-character replacements

    'ай': ['ai', 'ay', 'i'],
    'ий': ['y', 'ei', 'ey', 'i'],
    'дж': ['dj', 'dg', 'j'],
    'дз': ['dz', 'z'],
    'ей': ['ey'],
    'из': ['iz'],
    'кх': ['kh'],
    'цз': ['ji'],
    'нк': ['nj'],
    'ья': ['a', 'y', 'i'],
    'чж': ['zh'],
    'цз': ['z', 'j'],
    'ци': ['qi'],
    'йе': ['ille'],
    'ск': ['sch'],
    'ти': ['chi'],
    'кь': ['chi'],
    'ль': ['hl'],
    'йи': ['illy'],
    'сюй': ['hsu'],
    'кс': ['x'],

    // Russian 3-character replacements

    'эйт': ['ate'],
    'иве': ['ephe'],
    'авг': ['aug'],
    'мак': ['mc'],

    // Russian 4-character replacements

    'илье': ['uillet'],

    // English 1-character replacements

    'y': ['i'],
    'u': ['o'],
    'c': ['s'],
    's': ['c'],
    'i': ['y', 'e'],
    'e': ['a', 'ai'],
    'ha': ['a'],
    'xi': ['i'],
    'ie': ['ye'],
    'ye': ['ie'],

    // Other language 1-character replacements
    
    'ö': ['o'],
    'ü': ['u', 'o'],
    'ä': ['a'],
    'á': ['a'],

    // Other replacements

    'II': ['2'],
};

const MAX_SLICE_LENGTH = Math.max(
    ...Object.keys(replacements).map((slice) => slice.length),
    ...Object.values(replacements)
        .reduce((allReplacements, replacements) => {
            return [
                ...allReplacements,
                ...replacements,
            ];
        }, [])
        .map((replacement) => replacement.length)
);

// ----------------------------------------------------------------------

let wordComparisonCache = {
    results: {},

    getResultKeyByWords(word1, word2) {
        return word1 < word2 ? `${word1}:${word2}` : `${word2}:${word1}`;
    },

    renewDestoryingTimeout(result) {
        clearTimeout(result.destroyingTimeout);

        result.destroyingTimeout = setTimeout(() => {
            delete this.results[result.key];
            // console.info(`WordComparisonResult "${result.key}" was destroyed.`);
        }, 60 * 1000);
    },

    getResult(word1, word2) {
        let resultKey = this.getResultKeyByWords(word1, word2);
        let result = this.results[resultKey] || null;

        if (!result) {
            return null;
        }
        
        this.renewDestoryingTimeout(result);
        return result;
    },

    setResult(word1, word2, value) {
        let resultKey = this.getResultKeyByWords(word1, word2);
        let result = this.results[resultKey] || null;

        if (result) {
            throw new Error(`WordComparisonResult "${resultKey}" already exists.`);
        }

        result = this.results[resultKey] = {
            value,
            destroyingTimeout: null,
        };

        this.renewDestoryingTimeout(result);
        // console.info(`WordComparisonResult "${resultKey}" was stored with value "${value}".`);
    },
};

// ----------------------------------------------------------------------


function compareNamesWithCash(word1, word2){
    let wordComparisonResult = wordComparisonCache.getResult(word1, word2);

    if (wordComparisonResult) {
        return wordComparisonResult.value;
    } else {
        let areWordsSimilar = compareWords({ word1, word2 });
        wordComparisonCache.setResult(word1, word2, areWordsSimilar);
        return areWordsSimilar;
    }
}
// let word1 = 'shang';
// let word2 = 'санок';

// word1 = word1.toLowerCase();
// word2 = word2.toLowerCase();

// console.info(`Comparing "${word1}" with "${word2}"...`);
// let startedAt = performance.now();

// for (let iteration = 0; iteration < 5; ++iteration) {
//     let wordComparisonResult = wordComparisonCache.getResult(word1, word2);

//     if (wordComparisonResult) {
//         // console.info('Are words similar? (from cache)', wordComparisonResult.value);
//     } else {
//         let areWordsSimilar = compareWords({ word1, word2 });
//         wordComparisonCache.setResult(word1, word2, areWordsSimilar);
//         console.info('Are words similar?', areWordsSimilar);
//     }
// }

// let finishedAt = performance.now();
// let totalTime = finishedAt - startedAt;
// console.info('Total time:', totalTime);

// ----------------------------------------------------------------------

function makeWordPieceOptions({ word, offset }) {
    let wordPieceOptions = {};

    for (let wordPieceLength = 1; wordPieceLength <= MAX_SLICE_LENGTH; ++wordPieceLength) {
        let wordPiece = word.slice(offset, offset + wordPieceLength);

        if (wordPiece.length < wordPieceLength) {
            break;
        }

        if (!wordPiece) {
            throw new Error(`Impossible case.`);
        }

        let wordPieceReplacements = replacements[wordPiece] || null;

        if (wordPieceReplacements) {
            for (let wordPieceReplacement of wordPieceReplacements) {
                let wordPieceOption = (wordPieceOptions[wordPieceReplacement] ||= {});
                wordPieceOption[wordPieceLength] ||= true;
            }
        }

        let wordPieceOption = (wordPieceOptions[wordPiece] ||= {});
        wordPieceOption[wordPieceLength] ||= true;
    }

    return Object.fromEntries(
        Object.entries(wordPieceOptions)
            .map(([wordPieceOptionKey, word1PieceOptionLengths]) => {
                return [
                    wordPieceOptionKey,
                    Object.keys(word1PieceOptionLengths).map(Number),
                ];
            })
    );
}

function compareWords({
    word1,
    word2,
    word1Offset = 0,
    word2Offset = 0,
    level = 0,
}) {
    if (
        word1.length === word1Offset ||
        word2.length === word2Offset
    ) {
        return true;
    }

    let word1PieceOptions = makeWordPieceOptions({
        word: word1,
        offset: word1Offset,
    });

    // console.info(level, 'word1PieceOptions', word1PieceOptions);

    if (word1PieceOptions['']) {
        return compareWords({
            word1,
            word2,
            word1Offset: word1Offset + Math.max(...word1PieceOptions['']),
            word2Offset,
        });
    }

    let word2PieceOptions = makeWordPieceOptions({
        word: word2,
        offset: word2Offset,
    });

    // console.info(level, 'word2PieceOptions', word2PieceOptions);

    if (word2PieceOptions['']) {
        return compareWords({
            word1,
            word2,
            word1Offset,
            word2Offset: word2Offset + Math.max(...word2PieceOptions['']),
        });
    }

    let commonWordPieceOptionKeys = intersection(
        Object.keys(word1PieceOptions),
        Object.keys(word2PieceOptions)
    ).reverse();

    // console.info(level, 'commonWordPieceOptionKeys', commonWordPieceOptionKeys);

    for (let commonWordPieceOptionKey of commonWordPieceOptionKeys) {
        let word1PieceOptionLengths = word1PieceOptions[commonWordPieceOptionKey];
        let word2PieceOptionLengths = word2PieceOptions[commonWordPieceOptionKey];

        for (let word1PieceOptionLength of word1PieceOptionLengths) {
            for (let word2PieceOptionLength of word2PieceOptionLengths) {
                let areWordsSimilar = compareWords({
                    word1,
                    word2,
                    word1Offset: word1Offset + word1PieceOptionLength,
                    word2Offset: word2Offset + word2PieceOptionLength,
                    level: level + 1,
                });

                if (!areWordsSimilar) {
                    continue;
                }

                return true;
            }
        }
    }

    return false;
}


module.exports = compareNamesWithCash;