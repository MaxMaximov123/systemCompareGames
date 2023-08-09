<template>
    <title>Graphic</title>
    <!-- <Chart :chartData="chartData" :chartOptions="chartOptions" /> -->
    <v-tabs v-model="activeTab">
        <v-tab @click="getData(0)">Коэффициенты</v-tab>
        <v-tab @click="getData(1)">Счет</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
        <v-window-item value="0">
            <h3 style="text-align: center;">{{ infoLabel1 }}</h3>
            <v-combobox
                v-model="selectedPathOutcomes"
                :items="pathsOutcomes"
                @update:modelValue="getData(activeTab)"
                class="combobox">
            </v-combobox>
            <plotly-chart :data="dataOutcomes" :layout="layoutOutcomes" />
        </v-window-item>

        <v-window-item value="1">
            <h3 style="text-align: center;">{{ infoLabel2 }}</h3>
            <v-combobox
                v-model="selectedPathScores"
                :items="pathsScores"
                @update:modelValue="getData(activeTab)"
                class="combobox">
            </v-combobox>
            <plotly-chart :data="dataScores" :layout="layoutScores" />
        </v-window-item>
    </v-window>
    <div v-if="isLoading" class="progress-overlay">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
    </div>
    
</template>
<script >

import router from '@/router';
import PlotlyChart from '@/components/PlotlyChart.vue';

export default {
    components: {
        PlotlyChart,

    },
    data(){
        return {
            apiHost: 0 ? 'localhost:8005' : '195.201.58.179:8005',
            id: 1,
            activeTab: 0,
            TIK_STEP: 3,

            selectedPathOutcomes: null,
            selectedPathScores: null,
            paths: [],

            infoLabel1: '',
            infoLabel2: ''
            ,
            isLoading: true,

            pathsOutcomes: [],
            pathsScores: [],

            bookieKey1: '',
            bookieKey2: '',

            similarityOutcomes: 0,
            similarityScores: 0,

            game1: {
                outcomes: [],
                scores: [],
            },
            game2: {
                outcomes: [],
                scores: [],
            },
            dataOutcomes: [],
            dataScores: [],
            layoutOutcomes: {
                grid: {rows: 2, columns: 1},
                title: 'История',
                // yaxis1: {range: [0, 10]},
                // yaxis2: {range: [0, 10]}
            },
            layoutScores: {
                grid: {rows: 2, columns: 1},
                title: 'История',
                // yaxis1: {range: [0, 10]},
                // yaxis2: {range: [0, 10]}
            },
    

        }
    },

    async mounted() {
        this.id = Number(this.$route.params.id);
        this.typeGraph = this.$route.params.type;
        if (this.typeGraph === 'outcomes') this.activeTab = 0;
        if (this.typeGraph === 'scores') this.activeTab = 1;
        this.pathsOutcomes = (await this.postRequest(`http://${this.apiHost}/api/paths`, {id: this.id, type: 'outcomes'})).data;
        this.pathsScores = (await this.postRequest(`http://${this.apiHost}/api/paths`, {id: this.id, type: 'scores'})).data;
        if (this.pathsOutcomes.length === 0 || this.pathsScores.length === 0) {
            if (this.pathsOutcomes.length === 0) this.infoLabel1 = 'Данные по игре отсутствуют!';
            if (this.pathsScores.length === 0) this.infoLabel2 = 'Данные по игре отсутствуют!';
            this.isLoading = false;
        } else {
            this.infoLabel1 = '';
            this.infoLabel2 = '';
            this.selectedPathOutcomes = this.pathsOutcomes[0];
            this.selectedPathScores = this.pathsScores[0];
            this.getData(this.activeTab);
        }
        
    },

    methods: {
        async updatePlot(e=null){
            if (this.activeTab){ // scores
                this.dataScores = [{
                    x: Object.keys(this.game1.scores),
                    y: Object.keys(this.game1.scores).map(now => this.game1.scores[now][this.selectedPathScores]?.val),
                    type: 'bar',
                    name: this.bookieKey1,
                    xaxis: 'x1',
                    yaxis: 'y1',
                    text: Object.keys(this.game1.scores).map(now => `Время: ${this.getTimeFromTimestamp(now)}`),
                    hovertemplate: '%{text} ' + 'Счет: %{y:.2f}',
                    textposition: 'none',
                },
                {
                    x: Object.keys(this.game2.scores),
                    y: Object.keys(this.game2.scores).map(now => this.game2.scores[now][this.selectedPathScores]?.val),
                    type: 'bar',
                    name: this.bookieKey2,
                    xaxis: 'x2',
                    yaxis: 'y2',
                    text: Object.keys(this.game2.scores).map(now => `Время: ${this.getTimeFromTimestamp(now)}`),
                    hovertemplate: '%{text} ' + 'Счет: %{y:.2f}',
                    textposition: 'none',
                }
                ];
                this.paths = this.copy(this.pathsScores);
            } else {
                this.dataOutcomes = [{
                    x: Object.keys(this.game1.outcomes),
                    y: Object.keys(this.game1.outcomes).map(now => this.game1.outcomes[now][this.selectedPathOutcomes]?.val),
                    type: 'bar',
                    name: this.bookieKey1,
                    xaxis: 'x1',
                    yaxis: 'y1',
                    text: Object.keys(this.game1.outcomes).map(now => `Время: ${this.getTimeFromTimestamp(now)}`),
                    hovertemplate: '%{text} ' + 'Кэф.: %{y:.2f}',
                    showlegend: false,
                    textposition: 'none'
                },
                {
                    x: Object.keys(this.game2.outcomes),
                    y: Object.keys(this.game2.outcomes).map(now => this.game2.outcomes[now][this.selectedPathOutcomes]?.val),
                    type: 'bar',
                    name: this.bookieKey2,
                    xaxis: 'x2',
                    yaxis: 'y2',
                    text: Object.keys(this.game1.outcomes).map(now => `Время: ${this.getTimeFromTimestamp(now)}`),
                    hovertemplate: '%{text} ' + 'Кэф.: %{y:.2f}',
                    showlegend: false,
                    textposition: 'none'
                },
                ];
            }
        },

        getTimeFromTimestamp(timestamp){
            const date = new Date(Number(timestamp) * 1000);
            const hours = date.getHours();
            const minutes = "0" + date.getMinutes();
            const seconds = "0" + date.getSeconds();
            const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
            return formattedTime;
        },
        async getData(type=0){
            this.isLoading = true;
            if (this.activeTab === 0) this.typeGraph = 'outcomes';
            if (this.activeTab === 1) this.typeGraph = 'scores';
            router.push({path: `/graphic/${this.id}/${this.typeGraph}`});
            var res = null;
            if (type === 0) {
                res = await this.postRequest(`http://${this.apiHost}/api/graphic`, {id: this.id, type: type, path: this.selectedPathOutcomes});
                res = res.data;
                this.game1.outcomes = res.game1;
                this.game2.outcomes = res.game2;
                this.formatData(this.game1.outcomes, this.game2.outcomes);
                const rangeOutcomes1 = Math.max(...res.game1.map(obj => obj.odds));
                const rangeOutcomes2 = Math.max(...res.game2.map(obj => obj.odds));
                const rangeOutcomes = Math.max(rangeOutcomes1, rangeOutcomes2);
                this.layoutOutcomes = {
                    grid: {rows: 2, columns: 1},
                    title: 'История коэффициентов',
                    yaxis1: {range: [0, rangeOutcomes]},
                    yaxis2: {range: [0, rangeOutcomes]}
                }
                this.compareOutcomes();
            }
            if (type === 1) {
                res = await this.postRequest(`http://${this.apiHost}/api/graphic`, {id: this.id, type: type, path: this.selectedPathScores});
                res = res.data;
                this.game1.scores = res.game1;
                this.game2.scores = res.game2;
                this.formatData(this.game1.scores, this.game2.scores);
                const rangeScores1 = Math.max(...res.game1.map(obj => obj.score));
                const rangeScores2 = Math.max(...res.game2.map(obj => obj.score));
                const rangeScores = Math.max(rangeScores1, rangeScores2);
                this.layoutScores = {
                    grid: {rows: 2, columns: 1},
                    title: 'История счета',
                    yaxis1: {range: [-1, rangeScores]},
                    yaxis2: {range: [-1, rangeScores]}
                }
                this.compareScores();
            }


            this.bookieKey1 = res.game1[0].bookieKey;
            this.bookieKey2 = res.game2[0].bookieKey;
            this.updatePlot();
            this.isLoading = false;
        },

        postRequest(url, data){
            this.isLoading = true;
            return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };
            
            fetch(url, options)
            .then(response => response.json())
            .then(result => {
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
            })
            this.isLoading = false;
        },

        copy(obj){
            return JSON.parse(JSON.stringify(obj));
        },

        sum(arr){
            let sum_ = 0;
            arr.forEach((val) => sum_ += Number(val));
            return sum_;
        },


        formatData(game1, game2){
            const minTime = Math.floor(Math.max(game1[0].now, game2[0].now) / 1000);
            const maxTime = Math.floor(Math.max(game1.at(-1).now, game2.at(-1).now) / 1000);

            const newGame1 = {};
            const newGame2 = {};
            
            const path1 = game1[0].path;
            const path2 = game2[0].path;
            
            const lastStateGame1 = {};
            lastStateGame1[path1] = {ind: 0, time: minTime, val: null};
            const lastStateGame2 = {};
            lastStateGame2[path2] = {ind: 0, time: minTime, val: null};
            
            for (let timeStep=minTime;timeStep<maxTime;timeStep+=this.TIK_STEP){
                newGame1[timeStep] = {};
                newGame2[timeStep] = {};

                const minInd1 = Math.max(...Object.keys(lastStateGame1).map((key) => {return lastStateGame1[key].ind}));
                const minInd2 = Math.max(...Object.keys(lastStateGame2).map((key) => {return lastStateGame2[key].ind}));
                
                for (let indGame1=minInd1; indGame1<game1.length-1; indGame1++){
                    if (Math.floor(game1[indGame1].now / 1000) <= timeStep){
                        lastStateGame1[game1[indGame1].path] = {
                            ind: indGame1,
                            time: timeStep,
                            val: this.activeTab ? game1[indGame1].score : game1[indGame1].odds
                        };
                        if (lastStateGame1[game1[indGame1].path].val === 0) lastStateGame1[game1[indGame1].path].val = 0.2;
                    } else break;
                }

                for (let indGame2=minInd2; indGame2<game2.length-1; indGame2++){
                    if (Math.floor(game2[indGame2].now / 1000) <= timeStep){
                        lastStateGame2[game2[indGame2].path] = {
                            ind: indGame2,
                            time: timeStep,
                            val: this.activeTab ? game2[indGame2].score : game2[indGame2].odds
                        };
                        if (lastStateGame2[game2[indGame2].path].val === 0) lastStateGame2[game2[indGame2].path].val = 0.2;
                    } else break;
                }
                newGame1[timeStep] = this.copy(lastStateGame1);
                newGame2[timeStep] = this.copy(lastStateGame2);
            }

            if (this.activeTab){
                this.game1.scores = newGame1;
                this.game2.scores = newGame2;
            } else {
                this.game1.outcomes = newGame1;
                this.game2.outcomes = newGame2;
            }
        },
        
        async compareOutcomes(){
            const newGame1 = this.game1.outcomes;
            const newGame2 = this.game2.outcomes;

            const totalSimOutcOnTik = {};
            const totalSimOutc = {};

            // ___________Сравнение_данных______________
            for (const tik in newGame1){
                for (const outcomePath in newGame1[tik]){
                    if (outcomePath in newGame2[tik] && newGame2[tik][outcomePath].val && newGame1[tik][outcomePath].val){
                        const d1 = newGame1[tik][outcomePath].val;
                        const d2 = newGame2[tik][outcomePath].val;
                        if (d1 !== null && d2 !== null && d1 > 0 && d2 > 0){
                            const simTwoOutcome = Math.min(d1, d2) / Math.max(d1, d2);
                            if (!(outcomePath in totalSimOutcOnTik)) totalSimOutcOnTik[outcomePath] = {sim: 0, count: 0};
                            totalSimOutcOnTik[outcomePath].sim += simTwoOutcome;
                            totalSimOutcOnTik[outcomePath].count ++;
                        }
                    }
                }
            }
            for (let key in totalSimOutcOnTik){
                totalSimOutc[key] = totalSimOutcOnTik[key].sim / totalSimOutcOnTik[key].count;
            }
            const result = Object.values(totalSimOutc);
            this.similarityOutcomes = this.sum(result) / result.length;
            this.layoutOutcomes.title = 'История коэффициентов. Сходство: ' + 
            (this.similarityOutcomes ? Math.floor(this.similarityOutcomes * 10000) / 100 + '%' : 'неизвестно');
        },

        async compareScores(){
            const newGame1 = this.game1.scores;
            const newGame2 = this.game2.scores;

            const maxScore = {};

            for (let tik in newGame1){
                for (let path in newGame1[tik]){
                    if (!(path in maxScore)){
                        maxScore[path] = newGame1[tik][path].val;
                    } else if (newGame1[tik][path].val > maxScore[path]){
                        maxScore[path] = newGame1[tik][path].val;
                    }
                }
                for (let path in newGame2[tik]){
                    if (path in maxScore && newGame2[tik][path].val > maxScore[path]){
                        maxScore[path] = newGame2[tik][path].val;
                    }
                }
            }

            const totalSimOutcOnTik = {};
            const totalSimOutc = {};

            // ___________Сравнение_данных______________
            for (const tik in newGame1){
                for (const outcomePath in newGame1[tik]){
                    if (outcomePath in newGame2[tik] && newGame2[tik][outcomePath].val && newGame1[tik][outcomePath].val){
                        const d1 = newGame1[tik][outcomePath].val;
                        const d2 = newGame2[tik][outcomePath].val;
                        if (d1 !== null && d2 !== null){
                            const simTwoOutcome = 1 - Math.abs(d1 - d2) / maxScore[outcomePath];
                            if (!(outcomePath in totalSimOutcOnTik)) totalSimOutcOnTik[outcomePath] = {sim: 0, count: 0};
                            totalSimOutcOnTik[outcomePath].sim += simTwoOutcome;
                            totalSimOutcOnTik[outcomePath].count ++;
                        }
                        
                    }
                }
            }
            for (let key in totalSimOutcOnTik){
                totalSimOutc[key] = totalSimOutcOnTik[key].sim / totalSimOutcOnTik[key].count;
            }
            const result = Object.values(totalSimOutc);
            this.similarityScores = this.sum(result) / result.length;
            this.layoutScores.title = 'История счета. Сходство: ' + 
            (this.similarityScores ? Math.floor(this.similarityScores * 10000) / 100 + '%' : 'неизвестно');
        
        }
    }
}
</script>
<style>
    .chart {
      width: 100%; /* Измените значение для изменения ширины */
      height: 100%; /* Измените значение для изменения высоты */
      font-size: 16px; /* Измените значение для изменения размера шрифта */
    }
    
    .combobox {
        width: 30%;
    }

    .progress-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.7); /* Цвет затемненного фона */
        z-index: 9999; /* Значение z-index для поверхности */
        }
</style>