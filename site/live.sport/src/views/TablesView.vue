<template>
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet">
    <h3 class="title">Результаты сравнения игр</h3>
    
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
            pairs: [],
            currentPage: 1,
            pageCount: 1000,
            oneGrouped: false,

        }
    },

    mounted() {
        this.currentPage = Number(this.$route.params.page);
        this.render();
    },

    methods: {
        async getPairs(){
            const res = await this.postRequest('http://127.0.0.1:8005/api/pairs', {page: this.currentPage, oneGrouped: this.oneGrouped});
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
        }
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