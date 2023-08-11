<template>
    <title>Pair Games</title>
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet">
    <h3 class="title">Результаты сравнения игр</h3>
    
    <table class="filters">
        <tr>
            <th>Сходство названий:</th>
            <th>Пересечение старта:</th>
            <th>Сходство пре. кэфов:</th>
            <th>Сходство лайв кэфов:</th>
            <th>Сходство счета:</th>
            <th>Новой системой?</th>
            <th>Старой системой?</th>

            <th rowspan="2">
                <v-btn @click="applyFilters">Применить</v-btn>
            </th>
        </tr>
        <tr>
            <td style="width: 14.5%;" v-for="filter in Object.keys(filters).filter(f => f !== 'groupedNewSystem' && f !== 'groupedOldSystem')" :key="filter">
                <div class="data-frame">
                    <v-text-field v-model="filters[filter].min" style="margin-right: 10px;" variant="outlined" label="От" type="number" step="0.01" :max="1" :min="0"></v-text-field>
                    <v-text-field v-model="filters[filter].max" label="До" variant="outlined" type="number" step="0.01" :max="1" :min="0"></v-text-field>
                </div>
            </td>

            <td style="width: 9%;">
                <v-combobox class="data-frame"
                    variant="outlined"
                    v-model="filters.groupedNewSystem"
                    :items="['Все', 'Да', 'Нет']">
                </v-combobox>
            </td>

            <td style="width: 9%;">
                <v-combobox class="data-frame"
                    variant="outlined"
                    v-model="filters.groupedOldSystem"
                    :items="['Все', 'Да', 'Нет']">
                </v-combobox>
            </td>

        </tr>
    </table>
    <div id="tables">
        <tablePair v-if="pairs.length > 0" :items="pairs"></tablePair>
    </div>
    
    <div style="font-size: 80%;">
    <v-pagination
      v-model="currentPage"
      total-visible="11"
      :length="pageCount"
      :onClick="updatePage"
      density="compact"
      size="50"
      class="custom-pagination"
    ></v-pagination>
  </div>
</template>
<script>

import router from '@/router';
import tablePair from '@/components/tablePair.vue'
import Paginate from 'vuejs-paginate-next';
import queryString from 'query-string';


export default {
    components: {
        tablePair,
        Paginate,
        

    },
    data(){
        return {
            filters: {
                simNames: {
                    min: 0,
                    max: 1,
                },

                timeDiscrepancy: {
                    min: 0,
                    max: 1,
                },

                simOutcomesPre: {
                    min: 0,
                    max: 1,
                },
                simOutcomesLive: {
                    min: 0,
                    max: 1,
                },
                simScores: {
                    min: 0,
                    max: 1,
                },
                groupedNewSystem: 'Все',
                groupedOldSystem: 'Все',
            },

            apiHost: 0 ? 'localhost:8005' : '195.201.58.179:8005',
            pairs: [],
            currentPage: 1,
            pageCount: 1000,
            oneGrouped: false,
            ipAddress: null

        }
    },

    async mounted() {
        this.queryParams = this.$route.query;
        this.filters = {
                simNames: {
                    min: this.queryParams.simNamesMin ? this.queryParams.simNamesMin : 0,
                    max: this.queryParams.simNamesMax ? this.queryParams.simNamesMax : 1,
                },
                timeDiscrepancy: {
                    min: this.queryParams.timeDiscrepancyMin ? this.queryParams.timeDiscrepancy : 0,
                    max: this.queryParams.timeDiscrepancyMax ? this.queryParams.timeDiscrepancyMax : 1,
                },

                simOutcomesPre: {
                    min: this.queryParams.simOutcomesPreMin ? this.queryParams.simOutcomesPreMin : 0,
                    max: this.queryParams.simOutcomesPreMax ? this.queryParams.simOutcomesPreMax : 1,
                },
                simOutcomesLive: {
                    min: this.queryParams.simOutcomesLiveMin ? this.queryParams.simOutcomesLiveMin : 0,
                    max: this.queryParams.simOutcomesLiveMax ? this.queryParams.simOutcomesLiveMax : 1,
                },
                simScores: {
                    min: this.queryParams.simScoresMin ? this.queryParams.simScoresMin : 0,
                    max: this.queryParams.simScoresMax ? this.queryParams.simScoresMax : 1,
                },
                groupedNewSystem: this.queryParams.groupedNewSystem ? this.queryParams.groupedNewSystem : 'Все',
                groupedOldSystem: this.queryParams.groupedOldSystem ? this.queryParams.groupedOldSystem : 'Все',
            },
        this.currentPage = Number(this.$route.params.page);
        this.render();
    },

    methods: {
        async applyFilters(){
            router.push({path: `/pairs/1`, query: this.getURLParams()});
            this.currentPage = 1;
            await this.render();
        },

        getURLParams(){
            return {
                groupedNewSystem: this.filters.groupedNewSystem,
                groupedOldSystem: this.filters.groupedOldSystem,
                simNamesMin: this.filters.simNames.min,
                simNamesMax: this.filters.simNames.max,
                timeDiscrepancyMin: this.filters.timeDiscrepancy.min,
                timeDiscrepancyMax: this.filters.timeDiscrepancy.max,
                simOutcomesPreMin: this.filters.simOutcomesPre.min,
                simOutcomesPreMax: this.filters.simOutcomesPre.max,
                simOutcomesLiveMin: this.filters.simOutcomesLive.min,
                simOutcomesLiveMax: this.filters.simOutcomesLive.max,
                simScoresMin: this.filters.simScores.min,
                simScoresMax: this.filters.simScores.max,
            };
        },

        async getPairs(){
            const res = await this.postRequest(`http://${this.apiHost}/api/pairs`, {page: this.currentPage, oneGrouped: this.oneGrouped, filters: this.filters});
            this.pageCount = Math.ceil(Number(res.pageCount[0].count) / 10);
            this.pairs = res.pairs;
        },

        async render(){
            await this.getPairs();
        },

        async updateGrouped(){
            await this.getPairs();
        },

        async updatePage(e){
            router.push({path: `/pairs/${this.currentPage}`, query: this.getURLParams()});
            await this.render();
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
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
            })
        },

    }
}
</script>
<style>
    /* @import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"; */

    .title {
        width: 300px; /* Задайте желаемую ширину элемента */
        margin-left: auto;
        margin-right: auto;
        margin-top: 15px;
        margin-bottom: 15px;
    }


    
    .input-val {
        font-size: 50%;
        height: 5%;
        width: 70%;
    }

    .filters {
        font-size: 80%;
        margin: auto;
        width: 90%;
    }

    .filters td {
        /* display: flex; */
        border: 2px solid rgb(255, 255, 255);
    }

    .data-frame {
        display: flex;
        font-size: 10px;
    }
</style>