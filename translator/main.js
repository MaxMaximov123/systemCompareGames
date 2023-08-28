const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);

const { Translator } = require('google-translate-api-x');
const translator = new Translator({from: 'auto', to: 'en', forceBatch: false, tld: 'es'});
await translator.translate(['привет', 'пока']);

async function translteAllWordsOfNames(){
    await translator.translate(['привет', 'пока']);
}