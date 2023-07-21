<template>
    <title>Graphic</title>
    <!-- <Chart :chartData="chartData" :chartOptions="chartOptions" /> -->
    <v-tabs v-model="activeTab">
        <v-tab @click="getData(0)">Коэффициенты</v-tab>
        <v-tab @click="getData(1)">Счет</v-tab>
    </v-tabs>
    <v-combobox
        v-model="selectedPath"
        :items="paths"
        @update:menu="updatePlot"
        class="combobox"></v-combobox>
    <plotly-chart :data="data" :layout="layout" />
    
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
            id: 1,
            activeTab: 0,
            TIK_STEP: 5,
            selectedPath: null,
            paths: [],
            game1: {
                outcomes: [],
                scores: [],
            },
            game2: {
                outcomes: [],
                scores: [],
            },
            data: [
            ],
            layout: {
                grid: {rows: 2, columns: 1},
                title: 'История',
                // yaxis1: {range: [0, range]},
                // yaxis2: {range: [0, range]}
            },
    

        }
    },

    async mounted() {
        this.id = Number(this.$route.params.id);
        this.render();
    },

    methods: {
        updatePlot(e=null){
            if (this.activeTab){
                this.data = [{
                    x: Object.keys(this.game1.scores).map(now => now / 1000),
                    y: Object.keys(this.game1.scores).map(now => this.game1.scores[now][this.selectedPath]?.val),
                    type: 'bar',
                    name: 'b1',
                    xaxis: 'x1',
                    yaxis: 'y1'
                },
                {
                    x: Object.keys(this.game2.scores).map(now => now / 1000),
                    y: Object.keys(this.game2.scores).map(now => this.game2.scores[now][this.selectedPath]?.val),
                    type: 'bar',
                    name: 'b1',
                    xaxis: 'x2',
                    yaxis: 'y2'
                },
                ];
            } else {
                this.data = [{
                    x: Object.keys(this.game1.outcomes).map(now => now / 1000),
                    y: Object.keys(this.game1.outcomes).map(now => this.game1.outcomes[now][this.selectedPath]?.val),
                    type: 'bar',
                    name: 'b1',
                    xaxis: 'x1',
                    yaxis: 'y1'
                },
                {
                    x: Object.keys(this.game2.outcomes).map(now => now / 1000),
                    y: Object.keys(this.game2.outcomes).map(now => this.game2.outcomes[now][this.selectedPath]?.val),
                    type: 'bar',
                    name: 'b1',
                    xaxis: 'x2',
                    yaxis: 'y2'
                },
                ];
            }
        },
        async getData(type=0){
            console.log(type)
            if (type === 0 && this.game1.outcomes.length === 0) {
                const res = await this.postRequest('http://localhost:8005/api/graphic', {id: this.id, type: type});
                this.game1.outcomes = res.game1;
                this.game2.outcomes = res.game2;
                this.formatData(this.game1.outcomes, this.game2.outcomes);
            }
            if (type === 1 && this.game1.scores.length === 0) {
                const res = await this.postRequest('http://localhost:8005/api/graphic', {id: this.id, type: type});
                this.game1.scores = res.game1;
                this.game2.scores = res.game2;
                this.formatData(this.game1.scores, this.game2.scores);
            }
            this.selectedPath = this.paths[0];
            this.updatePlot();
        },

        async render(){
            await this.getData(this.activeTab);
        },

        postRequest(url, data){
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
                console.log(result);
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
            })
        },

        copy(obj){
            return JSON.parse(JSON.stringify(obj));
        },

        formatData(game1, game2){
            const minTime = Math.floor(Math.max(game1[0].now, game2[0].now) / 1000);
            const maxTime = Math.floor(Math.max(game1.at(-1).now, game2.at(-1).now) / 1000);

            this.paths = [];
            const locPaths = [];

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
                        locPaths.push(game1[indGame1].path);
                        lastStateGame1[game1[indGame1].path] = {
                            ind: indGame1,
                            time: timeStep,
                            val: this.activeTab ? game1[indGame1].score : game1[indGame1].odds
                        };
                    } else break;
                }

                for (let indGame2=minInd2; indGame2<game2.length-1; indGame2++){
                    if (Math.floor(game2[indGame2].now / 1000) <= timeStep){
                        if (locPaths.includes(game2[indGame2].path)) this.paths.push(game2[indGame2].path);
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
</style>