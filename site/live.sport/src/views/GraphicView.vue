<template>
    <title>Graphic</title>
    <v-tabs v-model="activeTab">
        <v-tab @click="getData" value="outcomesPre">Пре. кэфы</v-tab>
        <v-tab @click="getData" value="outcomesLive">Лайв кэфы</v-tab>
        <v-tab @click="getData" value="scores">Счет</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
        <v-window-item :value="tab" v-for="tab in Object.keys(selectedPaths)" :key="tab">
            <v-combobox
                v-model="selectedPaths[tab]"
                @update:modelValue="getData"
                :items="paths[tab]"
                class="combobox">
            </v-combobox>
            <h3 style="text-align: center;">{{ infoLabels[tab] }}</h3>
            <plotly-chart :data="dataPlot[tab]" :layout="layouts[tab]" />
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
            activeTab: 'outcomesPre',
            TIK_STEP: 3,

            selectedPaths: {
                outcomesPre: 'null',
                outcomesLive: 'null',
                scores: 'null'
            },

            selectedPathOutcomesPre: '',
            selectedPathOutcomesLive: '',
            selectedPathScores: '',          

            infoLabels: {
                outcomesPre: '',
                outcomesLive: '',
                scores: ''
            },

            ranges: {
                outcomesPre: [0, 10],
                outcomesLive: [0, 10],
                scores: [-1, 10]
            },

            isLoading: true,

            paths: {
                outcomesPre: [],
                outcomesLive: [],
                scores: []
            },

            similarities: {
                outcomesPre: 0,
                outcomesLive: 0,
                scores: 0,
            },

            game1: {
                outcomesPre: [],
                outcomesLive: [],
                bookieKey: '',
                scores: [],
            },
            game2: {
                outcomesPre: [],
                outcomesLive: [],
                bookieKey: '',
                scores: [],
            },

            dataPlot: {
                outcomesPre: [],
                outcomesLive: [],
                scores: [],
            },

            layouts: {
                outcomesPre: {
                    grid: {rows: 2, columns: 1},
                    title: 'История',
                },

                outcomesLive: {
                    grid: {rows: 2, columns: 1},
                    title: 'История',
                },

                scores: {
                    grid: {rows: 2, columns: 1},
                    title: 'История',
                },
            },
    

        }
    },

    async mounted() {
        this.id = Number(this.$route.params.id);
        this.activeTab = this.$route.params.type;
        this.getData();
        
    },

    methods: {
        async updatePlot(e=null){
            this.dataPlot[this.activeTab] = [{
                x: Object.keys(this.game1[this.activeTab]),
                y: Object.keys(this.game1[this.activeTab]).map(now => this.game1[this.activeTab][now][this.selectedPaths[this.activeTab]]?.val),
                type: 'bar',
                name: this.game1.bookieKey,
                xaxis: 'x1',
                yaxis: 'y1',
                text: Object.keys(this.game1[this.activeTab]).map(now => `Время: ${this.getTimeFromTimestamp(now)}`),
                hovertemplate: '%{text} ' + 'Счет: %{y:.2f}',
                textposition: 'none',
            },
            {
                x: Object.keys(this.game2[this.activeTab]),
                y: Object.keys(this.game2[this.activeTab]).map(now => this.game2[this.activeTab][now][this.selectedPaths[this.activeTab]]?.val),
                type: 'bar',
                name: this.game2.bookieKey,
                xaxis: 'x2',
                yaxis: 'y2',
                text: Object.keys(this.game2[this.activeTab]).map(now => `Время: ${this.getTimeFromTimestamp(now)}`),
                hovertemplate: '%{text} ' + 'Счет: %{y:.2f}',
                textposition: 'none',
            },
            ];
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
                yaxis1: {range: [0, this.ranges[this.activeTab][1]]},
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

        updateSelectedPaths(key, val){
            this.selectedPaths[key] = val;
            console.log(this.selectedPaths[key]);
            this.getData();
        },


        formatData(game1, game2){
            const minTime = Math.floor(Math.min(game1[0].now, game2[0].now) / 1000);
            const maxTime = Math.floor(Math.max(game1.at(-1).now, game2.at(-1).now) / 1000) + this.TIK_STEP;
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
                
                for (let indGame1=minInd1; indGame1<game1.length; indGame1++){
                    if (Math.floor(game1[indGame1].now / 1000) <= timeStep){
                        lastStateGame1[game1[indGame1].path] = {
                            ind: indGame1,
                            time: timeStep,
                            val: this.activeTab.includes('outcomes') ? game1[indGame1].odds : game1[indGame1].score
                        };
                        if (lastStateGame1[game1[indGame1].path].val === 0) lastStateGame1[game1[indGame1].path].val = 0.2;
                    } else break;
                }

                for (let indGame2=minInd2; indGame2<game2.length; indGame2++){
                    if (Math.floor(game2[indGame2].now / 1000) <= timeStep){
                        lastStateGame2[game2[indGame2].path] = {
                            ind: indGame2,
                            time: timeStep,
                            val: this.activeTab.includes('outcomes') ? game2[indGame2].odds : game2[indGame2].score
                        };
                        if (lastStateGame2[game2[indGame2].path].val === 0) lastStateGame2[game2[indGame2].path].val = 0.2;
                    } else break;
                }
                newGame1[timeStep] = this.copy(lastStateGame1);
                newGame2[timeStep] = this.copy(lastStateGame2);
            }

            this.game1[this.activeTab] = newGame1;
            this.game2[this.activeTab] = newGame2;
        },
        
        
        async compareOutcomes(){
            const newGame1 = this.game1[this.activeTab];
            const newGame2 = this.game2[this.activeTab];

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
            this.similarities[this.activeTab] = this.sum(result) / result.length;
            this.layouts[this.activeTab].title = 'История. Сходство: ' + 
            (this.similarities[this.activeTab] ? Math.floor(this.similarities[this.activeTab] * 10000) / 100 + '%' : 'неизвестно');
        },

        async compareScores(){
            const newGame1 = this.game1[this.activeTab];
            const newGame2 = this.game2[this.activeTab];

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
            this.similarities[this.activeTab] = this.sum(result) / result.length;
            this.layouts[this.activeTab].title = 'История. Сходство: ' + 
            (this.similarities[this.activeTab] ? Math.floor(this.similarities[this.activeTab] * 10000) / 100 + '%' : 'неизвестно');
        
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