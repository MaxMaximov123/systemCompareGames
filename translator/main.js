const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);

const { Translator } = require('google-translate-api-x');
const translatorAuto = new Translator({from: 'auto', to: 'en', forceBatch: false, tld: 'es'});
const translatorDe = new Translator({from: 'de', to: 'en', forceBatch: false, tld: 'es'});
const translatorRu = new Translator({from: 'ru', to: 'en', forceBatch: false, tld: 'es'});


async function translteAllWordsOfNames(){
    while (true){
        const games = await db('games')
        .select('id', 'team1Name', 'team2Name')
        .whereNull('translatedAt');
        if (games.length === 0) continue;
        let wordsForTranslte = [];
        const updatesGames = [];
        for (let game of games){
            updatesGames.push({id: game.id, translatedAt: new Date()});
            wordsForTranslte.push(...game.team1Name.match(/[\p{Letter}\p{Mark}\p{Number}]+/ug) || []);
            wordsForTranslte.push(...game.team2Name.match(/[\p{Letter}\p{Mark}\p{Number}]+/ug) || []);
        }
        wordsForTranslte = Array.from(new Set(wordsForTranslte));
        const transltedWords = [];
        const resultsTranslteRu = await translatorRu.translate(wordsForTranslte);
        const resultsTranslteDe = await translatorDe.translate(wordsForTranslte);
        const resultsTranslteAuto = await translatorAuto.translate(wordsForTranslte);

        for (let translateObjNum=0;translateObjNum<wordsForTranslte.length;translateObjNum++){
            const originalWord = wordsForTranslte[translateObjNum];
            transltedWords.push({
                originalWord: originalWord,
                translationWord: resultsTranslteRu[translateObjNum].text + ';' + 
                    resultsTranslteDe[translateObjNum].text + ';' + 
                    resultsTranslteAuto[translateObjNum].text,
                createdAt: new Date()
            });
        }
        // try await db('translations').insert(transltedWords);
        await db.transaction(async (trx) => {
            for (const insertData of transltedWords) {
            await trx('translations')
                .insert(insertData)
                .onConflict('originalWord')
                .ignore();
            }
        })

        const query = updatesGames.map(update => {
            const { id, ...updateData } = update;
            return db('games')
            .where({ id })
            .update(updateData);
        });
        await Promise.all(query);
    }
}

translteAllWordsOfNames();