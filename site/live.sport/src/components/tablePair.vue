<template>
    <div>
        <table class="table" ref="table">
            <thead class="headers">
                <th></th>
                <th>Команда 1</th>
                <th>Команда 2</th>
                <th>Спорт</th>
                <th>Лайв?</th>
                <th>Букмекер</th>
                <th>Начало</th>
                <th>Сходство названий</th>
                <th>Сходство коэффициентов</th>
                <th>Сходство счета</th>
                <th>Объединены новой системой?</th>
                <th>Объединены старой системой?</th>
                <th>Создана</th>
                <th>В лайве</th>
            </thead>
            <tr class="none-tr"></tr>
            <tbody v-for="item in items" :key="item.id" class="data" :id="item.id">
                <tr>
                    <td rowspan="2" class="num-pair" :style="{ backgroundColor: getBackgroundColor(item) }">
                        <v-icon @click="downloadImage(item.id)" class="download-link">mdi-download</v-icon>
                        Пара {{ item.id }}
                        <a v-if="item.hashistory1 && item.hashistory2" :href="`../graphic/${item.id}`" class="invisible-link">График</a>
                    </td>
                    <td>
                        <v-icon :size="15" @click="copyToClipboard(item.game1Team1Name)" class="copy-name">mdi-content-copy</v-icon>
                        {{ item.game1Team1Name }}
                    </td>
                    <td>
                        <v-icon :size="15" @click="copyToClipboard(item.game1Team2Name)" class="copy-name">mdi-content-copy</v-icon>
                        {{ item.game1Team2Name }}
                    </td>
                    <td rowspan="2">
                        {{ item.sportKey }}
                    </td>
                    <td rowspan="2">
                        {{ item.isLive ? 'Да' : 'Нет' }}
                    </td>
                    <td>
                        {{ item.bookieKey1}}
                    </td>
                    <td>
                        {{ Number(item.startTime1) ? formatDateFromUnixTimestamp(item.startTime1) : 'Неизвестно'}}
                    </td>
                    <td rowspan="2">
                        {{ item.similarityNames }}
                    </td>
                    <td rowspan="2">
                        {{ item.similarityOutcomes ? item.similarityOutcomes : 'Неизвестно' }}
                    </td>
                    <td rowspan="2">
                        {{ item.similarityScores ? item.similarityScores : 'Неизвестно'}}
                    </td>
                    <td rowspan="2">
                        {{ item.needGroup ? 'Да' : 'Нет'}}
                    </td>
                    <td rowspan="2">
                        {{ item.grouped ? 'Да' : 'Нет'}}
                    </td>
                    <td rowspan="2">
                        {{ formatDateFromUnixTimestamp(item.now)}}
                    </td>
                    <td>
                        {{ formatDateFromUnixTimestamp(item.liveTill)}}
                    </td>
                </tr>
                <tr>
                    <td>
                        <v-icon :size="15" @click="copyToClipboard(item.game2Team1Name)" class="copy-name">mdi-content-copy</v-icon>
                        {{ item.game2Team1Name }}
                    </td>
                    <td>
                        <v-icon :size="15" @click="copyToClipboard(item.game2Team2Name)" class="copy-name">mdi-content-copy</v-icon>
                        {{ item.game2Team2Name }}
                    </td>
                    <td>
                        {{ item.bookieKey2}}
                    </td>
                    <td>
                        {{ Number(item.startTime2) ? formatDateFromUnixTimestamp(item.startTime2) : 'Неизвестно'}}
                    </td>
                </tr>
                <tr class="none-tr"></tr>
            </tbody>
        </table>
    </div>
  </template>
  
  <script>
  import html2canvas from 'html2canvas';
  export default {
    props: {
        items: {
            type: Object,
            required: true
        }
    },

    data() {
      return {

      };
    },

    mounted(){
    },
    
    methods: {
        formatDateFromUnixTimestamp(unixTimestamp) {
            return new Date(Number(unixTimestamp)).toLocaleString();
        },

        getBackgroundColor(row){
            if (row.needGroup === true && row.grouped === true){
                return '#50d92e';
            } else if (row.needGroup === false && row.grouped === false){
                return '#e18484';
            } else if (row.needGroup === true && row.grouped === false){
                return '#92de7f';
            } else {
                return '#e3df81';
            }
        },

        async downloadImage(id) {
            const tableRow = document.getElementById(id);
            const canvas = await html2canvas(tableRow);
            const dataURL = canvas.toDataURL();
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'table-image.png';
            link.click();
        },

        copyToClipboard(value) {
            const textArea = document.createElement('textarea');
            textArea.value = value;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
  };
  </script>
  <style>
    .table {
      font-size: 80%;
      margin-bottom: 20px;
      border-collapse: collapse;
      width: 90%;
      margin: 0 auto;
      margin-left: 3%;
      margin-right: 3%;
    }

    .headers th, td {
      padding: 8px;
      text-align: left;
      border: 2px solid grey;
    }

    .headers td {
      padding: 8px;
      text-align: left;
      border: 2px solid grey;
    }

    .headers th {
      background-color: #f2f2f2;
    }
    
    .none-tr {
        height: 15px;
    }

    .download-link {
        text-decoration: none;
        color: rgb(23, 23, 23);
        display: inline-flex;
        align-items: center;
        transform: rotate(180deg);
    }

    .download-link:hover {
        opacity: 0.6;
    }

    .download-link:active {
        opacity: 1;
    }

    .copy-name:hover {
        opacity: 0.6;
    }

    .copy-name:active {
        opacity: 0.3;
    }

    .data {
        margin-bottom: 10px; /* Расстояние между каждыми двумя строками (можно настроить по своему усмотрению) */
    }

    .num-pair {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        text-align: left;
        max-height: 150px;
    }


    .table td {
        /* background-color: #ffffff; Цвет фона ячеек данных */
        box-shadow: 0 2px 4px rgba(51, 51, 51, 0.1); /* Тень между ячейками */
    }

    .table th:first-child {
        visibility: hidden;
        opacity: 0;
        border: none;
    }

    .invisible-link {
        color: inherit;
    }

  </style>
  