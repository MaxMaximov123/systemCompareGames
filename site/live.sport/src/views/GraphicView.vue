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
            <plotly-chart :data="dataOutcomes" :layout="layoutOtcomes" />
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
            infoLabel2: '',
            isLoading: true,
            pathsOutcomes: [],
            pathsScores: [],
            bookieKey1: '',
            bookieKey2: '',
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
            layoutOtcomes: {
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
            await this.getData(this.activeTab);
        }
        
    },

    methods: {
        updatePlot(e=null){
            this.isLoading = true;
            if (this.activeTab){ // scores
                const range1 = Math.max(...Object.keys(this.game1.scores).map(now => this.game1.scores[now][this.selectedPathScores]?.val))
                const range2 = Math.max(...Object.keys(this.game2.scores).map(now => this.game2.scores[now][this.selectedPathScores]?.val))
                const range = Math.max(range1. range2);
                this.layoutOtcomes = {
                    grid: {rows: 2, columns: 1},
                    title: 'История',
                    yaxis1: {range: [0, range]},
                    yaxis2: {range: [0, range]}
                }
                this.dataScores = [{
                    x: Object.keys(this.game1.scores).map(now => now % 10000),
                    y: Object.keys(this.game1.scores).map(now => this.game1.scores[now][this.selectedPathScores]?.val),
                    type: 'bar',
                    name: this.bookieKey1,
                    xaxis: 'x1',
                    yaxis: 'y1'
                },
                {
                    x: Object.keys(this.game2.scores).map(now => now % 10000),
                    y: Object.keys(this.game2.scores).map(now => this.game2.scores[now][this.selectedPathScores]?.val),
                    type: 'bar',
                    name: this.bookieKey2,
                    xaxis: 'x2',
                    yaxis: 'y2'
                },
                ];
                this.paths = this.copy(this.pathsScores);
            } else {
                const range1 = Math.max(...Object.keys(this.game1.outcomes).map(now => this.game1.outcomes[now][this.selectedPathOutcomes]?.val))
                const range2 = Math.max(...Object.keys(this.game2.outcomes).map(now => this.game2.outcomes[now][this.selectedPathOutcomes]?.val))
                const range = Math.max(range1. range2);
                this.layoutOtcomes = {
                    grid: {rows: 2, columns: 1},
                    title: 'История',
                    yaxis1: {range: [0, range]},
                    yaxis2: {range: [0, range]}
                }
                this.dataOutcomes = [{
                    x: Object.keys(this.game1.outcomes).map(now => now % 10000),
                    y: Object.keys(this.game1.outcomes).map(now => this.game1.outcomes[now][this.selectedPathOutcomes]?.val),
                    type: 'bar',
                    name: this.bookieKey1,
                    xaxis: 'x1',
                    yaxis: 'y1'
                },
                {
                    x: Object.keys(this.game2.outcomes).map(now => now % 10000),
                    y: Object.keys(this.game2.outcomes).map(now => this.game2.outcomes[now][this.selectedPathOutcomes]?.val),
                    type: 'bar',
                    name: this.bookieKey2,
                    xaxis: 'x2',
                    yaxis: 'y2'
                },
                ];
                this.isLoading = false;
            }
        },
        async getData(type=0){
            this.isLoading = true;
            console.log(type)
            var res = null;
            if (type === 0) {
                res = await this.postRequest(`http://${this.apiHost}/api/graphic`, {id: this.id, type: type, path: this.selectedPathOutcomes});
                res = res.data;
                this.game1.outcomes = res.game1;
                this.game2.outcomes = res.game2;
                this.formatData(this.game1.outcomes, this.game2.outcomes);
            }
            if (type === 1) {
                res = await this.postRequest(`http://${this.apiHost}/api/graphic`, {id: this.id, type: type, path: this.selectedPathScores});
                res = res.data;
                this.game1.scores = res.game1;
                this.game2.scores = res.game2;
                this.formatData(this.game1.scores, this.game2.scores);
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
                    } else break;
                }

                for (let indGame2=minInd2; indGame2<game2.length-1; indGame2++){
                    if (Math.floor(game2[indGame2].now / 1000) <= timeStep){
                        lastStateGame2[game2[indGame2].path] = {
                            ind: indGame2,
                            time: timeStep,
                            val: this.activeTab ? game2[indGame2].score : game2[indGame2].odds
                        };
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