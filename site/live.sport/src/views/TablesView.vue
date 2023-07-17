<template>
    {{ currentPage }}
    <paginate
    :page-count="pageCount"
    :page-range="3"
    :margin-pages="2"
    :click-handler="clickCallback"
    :prev-text="'Prev'"
    :next-text="'Next'"
    :container-class="'pagination'"
    :page-class="'page-item'"
  >
  </paginate>
</template>
<script>

import Paginate from 'vuejs-paginate-next';
import router from '@/router';

export default {
    components: {
        Paginate,

    },
    data(){
        return {
            currentPage: 1,
            pageCount: 100,
        }
    },

    mounted() {
        this.render();
    },

    methods: {
        render(){
            this.currentPage = this.$route.params.page;
            console.log(this.currentPage)
            this.postRequest('http://127.0.0.1:3000/api/pairs', {'a': 10}).then((res) => console.log(res));
        },

        clickCallback(pageNum){
            router.push(`/pairs/${pageNum}`);
            this.render();
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
                // Handle the response data
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
    @import "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css";

    /* Write your own CSS for pagination */
    .pagination {
    }
    .page-item {
    }
</style>