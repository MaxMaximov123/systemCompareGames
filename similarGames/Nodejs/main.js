/**
 * @param {Array} game1 - History of first game
 * @param {Array} game2 - History of second game: game[i] = Object
 * game[i] = {
 *            "id": Integer,
 *            "globalGameId": Integer,
 *            "team1Name": String,
 *            "team2Name": String, 
 *            "score1": Integer,
 *            "score2": Integer,
 *            "first": Float,
 *            "draw": Float,
 *            "second": Float,
 *            "firstOrDraw": Float,
 *            "DrawOrSecond": Float,
 *            "now": Integer:,
 *            "bookie": String
 *          }

 */


function copy(obj){
    return JSON.parse(JSON.stringify(obj));
}

function compare_names(namesData){
    return new Promise((resolve, reject) => {
        const url = 'http://localhost:5000/api/names';  // Replace with your API endpoint

        // const data = {
        //     game1Name1: game1Name1,
        //     game1Name2: game1Name2,
        //     game2Name1: game2Name1,
        //     game2Name2: game2Name2
        // };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(namesData)
        })
        .then(response => response.json())
        .then(data => {
          // Handle the response data
          const result = Number(data.res);
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    })
}


function compare_games(game1, game2){
    return new Promise((resolve, reject) => {
    const TIK_STEP = 3;  // временной шаг(в секундах)
    const LiST_OUTCOMES = ['first', 'draw', 'second', 'firstOrDraw', 'firstOrSecond','drawOrSecond']; // список ключей исходов 
    const ALL_KEYS = ['id', 'globalGameId', 'team1Name', 'team2Name', 'score1', 'score2', 'first', 'draw', 'second', 'firstOrDraw', 'firstOrSecond', 'drawOrSecond']
    const KEYS = ['score1', 'score2', 'first', 'draw', 'second', 'firstOrDraw', 'firstOrSecond', 'drawOrSecond'];
    const START_TIME = new Date();

    // границы сдвига
    const START_SHIFT = -10;
    const FIN_SHIFT = 10;

    // ___________Выравнивание_данных_по_времени___________

    var min_time = Math.floor(Math.max(game1[0].now, game2[0].now) / 1000);
    var max_time = Math.floor(Math.max(game1.at(-1).now, game2.at(-1).now) / 1000);

    var new_game1 = [];
    var new_game2 = [];

    
    var last_state_game1 = {'ind': 0, 'time': min_time};
    var last_state_game2 = {'ind': 0, 'time': min_time};
    for (let time_step=min_time;time_step<max_time;time_step+=TIK_STEP){
        for (let ind_game1=last_state_game1.ind; ind_game1<game1.length-1; ind_game1++){
            // console.log(last_state_game1, game1[ind_game1].now, time_step);
            if (Math.floor(game1[ind_game1].now / 1000) <= time_step && Math.floor(game1[ind_game1 + 1].now / 1000) >= time_step){
                last_state_game1.ind = ind_game1;
                last_state_game1.time = time_step;
            }
        }
        let local_d1 = copy(game1[last_state_game1.ind]);
        local_d1.now = time_step;
        new_game1.push(local_d1);

        for (let ind_game2=last_state_game2.ind; ind_game2<game2.length-1; ind_game2++){
            if (Math.floor(game2[ind_game2].now / 1000) <= time_step && Math.floor(game2[ind_game2 + 1].now / 1000) >= time_step){
                last_state_game2.ind = ind_game2;
                last_state_game2.time = time_step;
            }
        }
        let local_d2 = copy(game2[last_state_game2.ind]);
        local_d2.now = time_step;
        new_game2.push(local_d2);
    }


    // ___________Сравнение_данных______________
    // console.log(new_game2);
    var total_similarity_scores = 0;
    var total_similarity_outcomes = {};
    LiST_OUTCOMES.forEach((outcome) => {total_similarity_outcomes[outcome] = 0})
    for (let key of KEYS){
        for (let shift=START_SHIFT;shift<FIN_SHIFT+1;shift++){
            var COUNT_TIKS = 0;
            var similarity_scores_on_shift = 0;
            var similarity_outcomes_on_shift = {};
            LiST_OUTCOMES.forEach((outcome) => {similarity_outcomes_on_shift[outcome] = 0})
            for (num_tik=-START_SHIFT;num_tik<new_game1.length-FIN_SHIFT;num_tik++){
                if (new_game1[num_tik + shift]?.[key] != null && new_game2[num_tik]?.[key] != null){
                    d1 = new_game1[num_tik + shift][key];
                    d2 = new_game2[num_tik][key];
                    if (['score1', 'score2'].includes(key)){
                        COUNT_TIKS++;
                        similarity_scores_on_shift += d1 === d2;
                    } else {
                        if (d1 != 0 && d2 != 0) {
                            COUNT_TIKS++;
                            similarity_outcomes_on_shift[key] += Math.min(d1, d2) / Math.max(d1, d2);
                        }
                    }
                }

            }

            console.log(similarity_outcomes_on_shift[key], key, COUNT_TIKS);
            if (COUNT_TIKS > FIN_SHIFT - START_SHIFT){
                similarity_scores_on_shift = similarity_scores_on_shift / COUNT_TIKS;
                similarity_outcomes_on_shift[key] = similarity_outcomes_on_shift[key] / COUNT_TIKS;
            } else {
                similarity_outcomes_on_shift = 0;
                similarity_scores_on_shift = 0;
            }
            if (similarity_outcomes_on_shift[key] > total_similarity_outcomes[key]) {total_similarity_outcomes[key] = similarity_outcomes_on_shift[key];}
            if (similarity_scores_on_shift > total_similarity_scores) {total_similarity_scores = similarity_scores_on_shift;}
        }
    }

    // total_similarity_outcomes['scores'] = total_similarity_scores;

    let result = {
        scores: total_similarity_scores,
        outcomes: 0
    }

    var count_outcomes = 0;
    for (let outcome in total_similarity_outcomes){
        if (total_similarity_outcomes[outcome]){
            count_outcomes++;
            result.outcomes += total_similarity_outcomes[outcome];
        }
    }
    result.outcomes = result.outcomes / count_outcomes;
    result.names = 0;
    // resolve([new_game1, new_game2, result]);
    const namesToSim = {
            game1Name1: new_game1[0].team1Name,
            game2Name1: new_game2[0].team1Name,
            game1Name2: new_game1[0].team2Name,
            game2Name2: new_game2[0].team2Name
        };
    console.log('WORK_TIME', (new Date() - START_TIME));
    compare_names(namesToSim).then((res) => {
        result.names = res;
        resolve([new_game1, new_game2, result]);
    }).catch(error => {resolve([new_game1, new_game2, result])})
    });
    


}

function sum(arr){
    let sum_ = 0;
    arr.forEach((val) => sum_ += val);
    return sum_;
}

function getRandomNumber(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

async function getDataSql(client, sqlQuery, values){
    try {
        return (await client.query(sqlQuery, values)).rows;
    } catch (error) {
        console.error('Error adding record:', error);
        return [];
    }
}


async function main() {
    const { Pool } = require('pg');
    require('dotenv').config();


    //_______________________________________//

    TIMEDELTA = 10 // минимальное время игры для ее сравнения (мин)

    //_______________________________________//

    // Создаем пул соединений к базе данных
    const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    database: process.env.POSTGRES_DB,
    port: 3200,
    });
    const client = await pool.connect();


    while (true){
        const game1Ids = await getDataSql(client, 'SELECT id FROM history', []);
        if (game1Ids){
            for (let game1Id of game1Ids){
                const timeDeltaGame1 = (await getDataSql(client, `SELECT FLOOR((MAX(now_) - MIN(now_)) / 60000) AS timeDelta FROM history WHERE (id = ${game1Id.id})`, []))[0].timedelta;
                console.log(timeDeltaGame1);
                if (timeDeltaGame1 >= TIMEDELTA){    
                    const game2Ids = await getDataSql(client,`SELECT id FROM history WHERE (id <> ${game1Id.id} AND sportKey = (SELECT sportKey FROM history WHERE id = ${game1Id.id} LIMIT 1))`, []);
                    for (let game2Id of game2Ids){
                        const timeDeltaGame2 = (await getDataSql(client, `SELECT FLOOR((MAX(now_) - MIN(now_)) / 60000) AS timeDelta FROM history WHERE (id = ${game2Id.id})`, []))[0].timedelta;
                        if (timeDeltaGame2 >= TIMEDELTA){
                            console.log(game1Id, game2Id);
                            // const game1Data = await getDataSql(client, `SELECT * FROM history WHERE id = ${game1Id.id}`, []);
                            // console.log(game1Data);
                        }
                    }
                }
            }
        }
        else {
            console.log('error');
        }
    }
}


if (require.main === module) {
    main();
}