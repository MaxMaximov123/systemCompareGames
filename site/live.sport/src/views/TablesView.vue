<template>
    <title>Pair Games</title>
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet">
    <h3 class="title">Результаты сравнения игр</h3>
    
    <table class="filters">
        <tr>
            <th>
                Сходство названий:
            </th>

            <th>
                Сходство коэффициентов:
            </th>

            <th>
                Сходство счета:
            </th>

            <th>
                Объединены новой системоой?
            </th>

            <th>
                Объединены старой системоой?
            </th>

            <th rowspan="2">
                <v-btn @click="applyFilters">Применить</v-btn>
            </th>
        </tr>
        <tr>
            <td>
                <div class="data-frame">
                    <v-text-field v-model="filters.simNames.min" style="margin-right: 10px;" label="От" type="number" step="0.01" :max="1" :min="0"></v-text-field>
                    <v-text-field v-model="filters.simNames.max" label="До" type="number" step="0.01" :max="1" :min="0"></v-text-field>
                </div>
            </td>

            <td>
                <div class="data-frame">
                    <v-text-field v-model="filters.simOutcomes.min" style="margin-right: 10px;" label="От" type="number" step="0.01" :max="1" :min="0"></v-text-field>
                    <v-text-field v-model="filters.simOutcomes.max" label="До" type="number" step="0.01" :max="1" :min="0"></v-text-field>
                </div>
            </td>

            <td>
                <div class="data-frame">
                    <v-text-field v-model="filters.simScores.min" style="margin-right: 10px;" label="От" type="number" step="0.01" :max="1" :min="0"></v-text-field>
                    <v-text-field v-model="filters.simScores.max" label="До" type="number" step="0.01" :max="1" :min="0"></v-text-field>
                </div>
            </td>

            <td>
                <v-combobox
                    v-model="filters.groupedNewSystem"
                    :items="['Все', 'Да', 'Нет']">
                </v-combobox>
            </td>

            <td>
                <v-combobox
                    v-model="filters.groupedOldSystem"
                    :items="['Все', 'Да', 'Нет']">
                </v-combobox>
            </td>

        </tr>
    </table>
    <div id="tables">
        <tablePair v-if="pairs.length > 0" :items="pairs"></tablePair>
    </div>
    
    <div>
    <v-pagination
      v-model="currentPage"
      :length="pageCount"
      :onClick="updatePage"
      :next-icon="'mdi-chevron-right'"
      :prev-icon="'mdi-chevron-left'"
    >
</v-pagination>
  </div>
</template>
<script>

import router from '@/router';
import tablePair from '@/components/tablePair.vue'
import Paginate from 'vuejs-paginate-next';


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

                simOutcomes: {
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
        this.currentPage = Number(this.$route.params.page);
        this.render();
    },

    methods: {
        async applyFilters(){
            router.push(`/pairs/1`);
            this.currentPage = 1;
            await this.render();
        },

        async getPairs(){
            const res = await this.postRequest(`http://${this.apiHost}/api/pairs`, {page: this.currentPage, oneGrouped: this.oneGrouped, filters: this.filters});
            this.pageCount = Math.floor(Number(res.pageCount[0].count) / 10);
            this.pairs = res.pairs;
        },

        async render(){
            await this.getPairs();
        },

        async updateGrouped(){
            await this.getPairs();
        },

        async updatePage(e){
            router.push(`/pairs/${this.currentPage}`);
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
                console.log(result);
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
        height: 5%;
        width: 70%;
    }

    .filters {
        font-size: 90%;
        margin: auto;
        width: 80%;
    }

    .filters td {
        /* display: flex; */
        border: 2px solid rgb(255, 255, 255);
    }

    .data-frame {
        display: flex;
    }
</style>