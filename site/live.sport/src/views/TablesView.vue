<template>
    <title>Pair Games</title>
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet">
    <h3 class="title">Результаты сравнения игр</h3>
    
    <!-- <v-container class="filter">
      <v-row>
        <v-col cols="12">
          <v-btn @click="showMenu = !showMenu">Фильтры</v-btn>
        </v-col>
      </v-row>
      <v-row v-if="showMenu" style="width: 30%;">
        <v-col cols="6">
            <label>Сходство названий</label>
            <div style="display: flex;">
                <v-text-field style="margin-right: 10px;" v-model="value1" label="От" type="number"></v-text-field>
                <v-text-field v-model="value1" label="До" type="number"></v-text-field>
            </div>
            
        </v-col>
        <v-col cols="6">
          <v-combobox
            label="Filter 2"
            v-model="filter2Value"
            :items="filter2Options"
            hide-selected
            multiple
            outlined
          ></v-combobox>
        </v-col>
        <v-col cols="6">
          <v-checkbox v-model="filter3Value" label="Filter 3"></v-checkbox>
        </v-col>
        <v-col cols="6">
          <v-checkbox v-model="filter4Value" label="Filter 4"></v-checkbox>
        </v-col>
      </v-row>
    </v-container> -->

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
            showMenu: false,
            filter1Value: [],
            filter1Options: ["Option 1", "Option 2", "Option 3"],
            filter2Value: [],
            filter2Options: ["Option A", "Option B", "Option C"],
            filter3Value: false,
            filter4Value: false,

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
        applyFilters() {
            // Здесь можно выполнить действия при применении фильтров
            console.log('Фильтры применены');
            console.log('Число 1:', this.value1);
            console.log('Число 2:', this.value2);
            console.log('Чекбокс 1:', this.checkbox1);
            console.log('Чекбокс 2:', this.checkbox2);
            this.menuOpen = false; // Закрытие меню после применения фильтров
            },
        async getPairs(){
            const res = await this.postRequest(`http://${this.apiHost}/api/pairs`, {page: this.currentPage, oneGrouped: this.oneGrouped});
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
            console.log(e)
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
    .tableHead {

    }
    .grouped {
        font-size: 24px;
        text-align: center;
    }

    .title {
        width: 300px; /* Задайте желаемую ширину элемента */
        margin-left: auto;
        margin-right: auto;
        margin-top: 15px;
        margin-bottom: 15px;
    }

    .pagination {
        display: flex;
        font-size: 18px;
        justify-content: center;
        align-items: center;
    }

    .pagination .v-pagination__item{
    color: #fff;
    background-color: #2196f3;
    border-radius: 10%;
    margin: 0 10px;
    height: 20px;
    width: 40px;
    padding: 10px;
    text-align: center;
    transition: background-color 0.3s;
    }
    
    .page-item {
        color: #fff;
        background-color: #2196f3;
        border-radius: 10%;
        margin: 0 10px;
        height: 30px;
        width: 40px;
        text-align: center;
        padding: 5px;
        transition: background-color 0.3s;
    }

    .pagination .v-pagination__item:hover {
        background-color: #1976d2;
        cursor: pointer;
    }

    .page-item:hover {
        background-color: #1976d2;
        cursor: pointer;
    }
    
</style>