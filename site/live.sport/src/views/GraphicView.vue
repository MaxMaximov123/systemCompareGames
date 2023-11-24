<template>
    <title>Graphic</title>
    <v-tabs v-model="activeTab">
        <v-tab @click="updatePlot" value="outcomesPre">Пре. кэфы</v-tab>
        <v-tab @click="updatePlot" value="outcomesLive">Лайв кэфы</v-tab>
        <v-tab @click="updatePlot" value="scores">Счет</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
        <v-window-item :value="tab" v-for="tab in Object.keys(data)" :key="tab">
            <v-combobox
                v-model="data[tab].selectedPath"
                @update:modelValue="updatePlot"
                :items="data[tab].paths"
                class="combobox">
            </v-combobox>
            <!-- <h3 style="text-align: center;">{{ infoLabels[tab] }}</h3> -->
            <plotly-chart :data="data[tab].plot" :layout="data[tab].layout" />
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
import Game from '../plugins/game';
import Collector from '../plugins/collector'

export default {
    components: {
        PlotlyChart,

    },
    data(){
        return {
            apiHost: 0 ? 'localhost:8005' : '148.251.6.25:8005',
            id: 1,
            activeTab: 'outcomesPre',
            TIK_STEP: 3,

            typePlotToGameUpdates: {
                outcomesLive: 'outcomeLiveUpdates',
                outcomesPre: 'outcomePreUpdates',
                scores: 'scoreUpdates',
            },
  
            
            data: {
                outcomesPre: {
                    selectedPath: '',
                    paths: [],
                    similarity: 0,
                    game1: [],
                    game2: [],
                    layout: {
                        grid: {rows: 2, columns: 1},
                        title: 'История',
                        yaxis: {
                            range: [0, 10],
                        },
                        yaxis2: {
                            range: [0, 10],
                        }
                    },
                    plot: {},
                },
                outcomesLive: {
                    selectedPath: '',
                    paths: [],
                    similarity: 0,
                    game1: [],
                    game2: [],
                    layout: {
                        grid: {rows: 2, columns: 1},
                        title: 'История',
                        yaxis: {
                            range: [0, 10],
                        },
                        yaxis2: {
                            range: [0, 10],
                        }
                    },
                    plot: {},
                },
                scores: {
                    selectedPath: '',
                    paths: [],
                    similarity: 0,
                    game1: [],
                    game2: [],
                    layout: {
                        grid: {rows: 2, columns: 1},
                        title: 'История',
                        yaxis: {
                            range: [-1, 10],
                        },
                        yaxis2: {
                            range: [-1, 10],
                        }
                    },
                    plot: {},
                }

            },

            isLoading: true,

        }
    },

    async mounted() {
        this.id = Number(this.$route.params.id);
        this.gameIds = (await this.postRequest(`http://${this.apiHost}/api/gameIds`, {id: this.id})).data[0];

        this.collector = new Collector({
            frontend: this
        });
        
        this.activeTab = this.$route.params.type;
        
        this.collector.on('authorized', async () => {
            this.games = {
                [this.gameIds.game1]: new Game({
                    id: this.gameIds.game1,
                    collector: this.collector,
                    frontend: this
                }),
                [this.gameIds.game2]: new Game({
                    id: this.gameIds.game2,
                    collector: this.collector,
                    frontend: this
                })
            }
        });

        this.collector.on('allGamesIsUpToDate', async () => {
            this.isLoading = false;

            this.updateData();

            this.data.outcomesLive.selectedPath = this.data.outcomesLive.paths[0];
            this.data.outcomesPre.selectedPath = this.data.outcomesPre.paths[0];
            this.data.scores.selectedPath = this.data.scores.paths[0];

            this.updatePlot();

            setInterval(this.updateData, 3000);
        });

    },

    methods: {
        updateData() {
            let game1OutcomeLivePaths = Object.keys(this.games[this.gameIds.game1].outcomeLiveUpdates);
            let game2OutcomeLivePaths = Object.keys(this.games[this.gameIds.game2].outcomeLiveUpdates);

            let commonOutcomeLivePaths = game1OutcomeLivePaths.filter(
                path => game2OutcomeLivePaths.includes(path)
            );
            this.data.outcomesLive.paths = commonOutcomeLivePaths;

            let game1OutcomePrePaths = Object.keys(this.games[this.gameIds.game1].outcomePreUpdates);
            let game2OutcomePrePaths = Object.keys(this.games[this.gameIds.game2].outcomePreUpdates);

            let commonOutcomePrePaths = game1OutcomePrePaths.filter(
                path => game2OutcomePrePaths.includes(path)
            );
            this.data.outcomesPre.paths = commonOutcomePrePaths;

            let game1ScoresPaths = Object.keys(this.games[this.gameIds.game1].scoreUpdates);
            let game2ScoresPaths = Object.keys(this.games[this.gameIds.game2].scoreUpdates);

            let commonScoresPaths = game1ScoresPaths.filter(
                path => game2ScoresPaths.includes(path)
            );
            this.data.scores.paths = commonScoresPaths;

            this.updatePlot();
        },

        async updatePlot(){
            this.isLoading = true;
            router.push({path: `/graphic/${this.id}/${this.activeTab}`});

            this.data[this.activeTab].game1 = this.games[this.gameIds.game1][
                this.typePlotToGameUpdates[this.activeTab]
            ][this.data[this.activeTab].selectedPath]?.updates || [];

            this.data[this.activeTab].game2 = this.games[this.gameIds.game2][
                this.typePlotToGameUpdates[this.activeTab]
            ][this.data[this.activeTab].selectedPath]?.updates || [];

            this.data[this.activeTab].layout.yaxis2.range[1] = Math.max(
                Math.max(
                    ...this.data[this.activeTab].game1.map(obj => obj.value)
                ),
                Math.max(
                    ...this.data[this.activeTab].game2.map(obj => obj.value)
                ),
            );

            this.data[this.activeTab].layout.yaxis.range[1] = this.data[this.activeTab].layout.yaxis2.range[1];

            this.data[this.activeTab].plot = [
                {
                    x: this.data[this.activeTab].game1.map(obj => obj.tikIndex),
                    y: this.data[this.activeTab].game1.map(obj => obj.value),
                    type: 'bar',
                    name: this.games[this.gameIds.game1].details.bookie.key,
                    xaxis: 'x1',
                    yaxis: 'y1',
                    text: this.data[this.activeTab].game1.map(obj => `Время: ${this.getTimeFromTimestamp(obj.tikIndex)}`),
                    hovertemplate: '%{text} ' + 'Счет: %{y:.2f}',
                    textposition: 'none',
                    range: this.data[this.activeTab].layout.range,
                },
                {
                    x: this.data[this.activeTab].game2.map(obj => obj.tikIndex),
                    y: this.data[this.activeTab].game2.map(obj => obj.value),
                    type: 'bar',
                    name: this.games[this.gameIds.game2].details.bookie.key,
                    xaxis: 'x2',
                    yaxis: 'y2',
                    text: this.data[this.activeTab].game2.map(obj => `Время: ${this.getTimeFromTimestamp(obj.tikIndex)}`),
                    hovertemplate: '%{text} ' + 'Счет: %{y:.2f}',
                    textposition: 'none',
                    range: this.data[this.activeTab].layout.range,
                },
            ];
            
            this.isLoading = false;
        },

        getTimeFromTimestamp(timestamp){
            const date = new Date(Number(timestamp) * 1000);
            const hours = date.getHours();
            const minutes = "0" + date.getMinutes();
            const seconds = "0" + date.getSeconds();
            const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
            return formattedTime;
        },
        async getData(){
            this.isLoading = true;
            router.push({path: `/graphic/${this.id}/${this.activeTab}`});
            if (this.paths[this.activeTab].length === 0) {
                this.paths[this.activeTab] = (await this.postRequest(`http://${this.apiHost}/api/paths`, {id: this.id, type: this.activeTab})).data;
                this.selectedPaths[this.activeTab] = this.paths[this.activeTab][0];
                this.selectedPathOutcomesPre = this.paths[this.activeTab][0];
                this.selectedPathOutcomesLive = this.paths[this.activeTab][0];
                this.selectedPathScores = this.paths[this.activeTab][0];
            }
            if (this.paths[this.activeTab].length === 0) {
                this.infoLabels[this.activeTab] =  'Данные по игре отсутствуют!'
                this.isLoading = false;
                return;
            } else {
                this.infoLabels[this.activeTab] =  '';
            }
            
            const res = (await this.postRequest(`http://${this.apiHost}/api/graphic`, {id: this.id, type: this.activeTab, path: this.selectedPaths[this.activeTab]})).data;
            this.game1[this.activeTab] = res.game1;
            this.game2[this.activeTab] = res.game2;
            this.formatData(this.game1[this.activeTab], this.game2[this.activeTab]);
            var range = [];
            if (this.activeTab === 'outcomesPre' || this.activeTab === 'outcomesLive'){
                range[0] = Math.max(...res.game1.map(obj => obj.odds));
                range[1] = Math.max(...res.game2.map(obj => obj.odds));
            } else {
                range[0] = Math.max(...res.game1.map(obj => obj.score));
                range[1] = Math.max(...res.game2.map(obj => obj.score));
            }
            range = Math.max(...range);
            this.ranges[this.activeTab][1] = range;
            this.layouts[this.activeTab] = {
                grid: {rows: 2, columns: 1},
                title: 'История',
                yaxis: {range: [0, this.ranges[this.activeTab][1]]},
                yaxis2: {range: [0, this.ranges[this.activeTab][1]]}
            }
            if (this.activeTab === 'outcomesPre' || this.activeTab === 'outcomesLive'){
                this.compareOutcomes();
            } else {
                this.compareScores();
            }


            this.game1.bookieKey = res.game1[0].bookieKey;
            this.game2.bookieKey = res.game2[0].bookieKey;
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