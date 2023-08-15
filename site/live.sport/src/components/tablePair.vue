<template>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
    <div>
        <table class="table" ref="table">
            <thead class="headers">
                <th></th>
                <th>Команда 1</th>
                <th>Команда 2</th>
                <th>Спорт</th>
                <th>Б.</th>
                <th>Начало</th>
                <th>В лайве</th>
                <th>Названия</th>
                <th>Сходство начала</th>
                <th>Пре. кэфы.</th>
                <th>Лайв кэфы.</th>
                <th>Счет</th>
                <th style="width: 5%;">Новой системой?</th>
                <th style="width: 5%;">Старой системой?</th>
                <th>Решения</th>
                <th>Создана</th>
                <th>Обновлена</th>
            </thead>
            <tr class="none-tr"></tr>
            <tbody v-for="item in items" :key="item.id" class="data" :id="item.id">
                <tr>
                    <td rowspan="2" class="num-pair" :style="{ backgroundColor: getBackgroundColor(item) }">
                        <v-icon @click="downloadImage(item.id)" class="download-link">mdi-download</v-icon>
                        Пара {{ item.id }}
                        <a v-if="item.hashistory1 && item.hashistory2" :href="`../graphic/${item.id}/outcomesPre`" target="_blank" class="invisible-link"><i class="fas fa-chart-line"></i></a>
                    </td>
                    <td style="text-align: left;">
                        <v-icon :size="15" @click="copyToClipboard(item.game1Team1Name)" class="copy-name">mdi-content-copy</v-icon>
                        {{ item.game1Team1Name }}
                    </td>
                    <td style="text-align: left;">
                        <v-icon :size="15" @click="copyToClipboard(item.game1Team2Name)" class="copy-name">mdi-content-copy</v-icon>
                        {{ item.game1Team2Name }}
                    </td>
                    <td rowspan="2">
                        {{ item.sportKey }}
                    </td>
                    <td>
                        <img class="bookie-icon" :src="'/bookie-icons/' + item.bookieKey1 + '.png'">
                    </td>
                    <td>
                        <p v-for="time of ( Number(item.startTime1) || Number(item.liveFrom1) ? formatDateFromUnixTimestamp(Number(item.startTime1) || Number(item.liveFrom1)) : 'Неизвестно').split('*')">{{ time }}</p>
                    </td>
                    <td style="position: relative; width: 10%; border: 1px solid #000"
                    class="py-1 px-2 text-center text-no-wrap text-caption">
                        <p>{{Number(item.liveFrom1) ? formatDateFromUnixTimestamp(item.liveFrom1).replace('*', ' ') : 'Неизвестно'}}</p>
                        <p>{{Number(item.liveFrom1) && Number(item.liveTill1) ? formatDateFromUnixTimestamp(item.liveTill1).replace('*', ' ') : '-'}}</p>
                    </td>
                    <td rowspan="2">
                        {{ Math.floor(item.similarityNames * 100 * 100) / 100 + '%' }}
                    </td>
                    <td rowspan="2">
                        {{ Math.floor(item.timeDiscrepancy * 100 * 100) / 100 + '%' }}
                    </td>
                    <td rowspan="2">
                        {{ item.similarityOutcomesPre ? Math.floor(item.similarityOutcomesPre * 100 * 100) / 100 + '%' : 'Неизвестно' }}
                    </td>
                    <td rowspan="2">
                        {{ item.similarityOutcomesLive ? Math.floor(item.similarityOutcomesLive * 100 * 100) / 100 + '%' : 'Неизвестно' }}
                    </td>
                    <td rowspan="2">
                        {{ item.similarityScores ? Math.floor(item.similarityScores * 100 * 100) / 100 + '%': 'Неизвестно'}}
                    </td>
                    <td rowspan="2">
                        {{ item.needGroup ? 'Да' : 'Нет'}}
                    </td>
                    <td rowspan="2">
                        {{ item.grouped ? 'Да' : 'Нет'}}
                    </td>
                    <td rowspan="2">
                        {{ item.decisionsCount }}
                    </td>
                    <td rowspan="2">
                        <p v-for="time of formatDateFromUnixTimestamp(item.now).split('*')">{{ time }}</p>
                    </td>
                    <td class="align-center">
                        <p v-for="time of ( Number(item.lastUpdate1) ? formatDateFromUnixTimestamp(Number(item.lastUpdate1)) : 'Неизвестно').split('*')">{{ time }}</p>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: left;">
                        <v-icon :size="15" @click="copyToClipboard(item.game2Team1Name)" class="copy-name">mdi-content-copy</v-icon>
                        {{ item.game2Team1Name }}
                    </td>
                    <td style="text-align: left;">
                        <v-icon :size="15" @click="copyToClipboard(item.game2Team2Name)" class="copy-name">mdi-content-copy</v-icon>
                        {{ item.game2Team2Name }}
                    </td>
                    <td>
                        <img class="bookie-icon" :src="'/bookie-icons/' + item.bookieKey2 + '.png'">
                    </td>
                    <td>
                        <p v-for="time of ( Number(item.startTime2) || Number(item.liveFrom2) ? formatDateFromUnixTimestamp(Number(item.startTime2) || Number(item.liveFrom2)) : 'Неизвестно').split('*')">{{ time }}</p>                    </td>
                    <td style="position: relative; width: 10%; border: 1px solid #000"
                    class="py-1 px-2 text-center text-no-wrap text-caption">
                        <p>{{Number(item.liveFrom2) ? formatDateFromUnixTimestamp(item.liveFrom2).replace('*', ' ') : 'Неизвестно'}}</p>
                        <p>{{Number(item.liveFrom2) && Number(item.liveTill2) ? formatDateFromUnixTimestamp(item.liveTill2).replace('*', ' ') : '-'}}</p>
                        <template
                            v-if="
                            item.liveFrom1 &&
                            item.liveTill1 &&
                            item.liveFrom2 &&
                            item.liveTill2
                            ">
                            <div class="gamePair__timeFrameDifference d-flex align-center">
                            <template v-if="timeFrameDifference(item.liveFrom1, item.liveTill1, item.liveFrom2, item.liveTill2) > 0">
                                Пересечение:
                                {{ Math.floor(timeFrameDifference(item.liveFrom1, item.liveTill1, item.liveFrom2, item.liveTill2) * 100) }}%
                            </template>
                            <template v-else>не пересекаются</template>
                            </div>
                        </template>
                    </td>
                    <td class="align-center">
                        <p v-for="time of ( Number(item.lastUpdate1) ? formatDateFromUnixTimestamp(Number(item.lastUpdate1)) : 'Неизвестно').split('*')">{{ time }}</p>
                    </td>
                    
                </tr>
                <tr class="none-tr"></tr>
            </tbody>
        </table>
    </div>
  </template>
  
  <script>
  import html2canvas from 'html2canvas';
  import moment from 'moment';
  export default {
    props: {
        items: {
            type: Object,
            required: true
        }
    },

    data() {
      return {
        textX: 0,
        textY: 0,
        isHovered: false
      };
    },

    mounted(){
    },
    
    methods: {
        formatDateFromUnixTimestamp(unixTimestamp) {
            return moment(new Date(Number(unixTimestamp))).format(`DD.MM.YYYY*HH:mm:ss`);
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
        },

        timeFrameDifference(liveFrom1, liveTill1, liveFrom2, liveTill2){
            return (Math.min(liveTill1, liveTill2) -
              Math.max(liveFrom1, liveFrom2)) /
            Math.max(
              liveTill1 - liveFrom1,
              liveTill2 - liveFrom2
            );
        },
    }
  };
  </script>
  <style>
    .table {
      font-size: 80%;
      margin-bottom: 20px;
      border-collapse: collapse;
      width: 95%;
      margin: 0 auto;
      margin-left: 3%;
      margin-right: 3%;
    }

    .headers th, td {
      padding: 8px;
      text-align: center;
      border: 2px solid grey;
    }

    .headers td {
      padding: 8px;
      text-align: center;
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
        writing-mode: vertical-lr;
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
        transform: rotate(180deg);
    }

    .fas {
        transform: rotate(180deg);
    }

    .fas:hover {
        opacity: 0.6;
    }

    .fas:active {
        opacity: 0.3;
    }

    .bookie-icon {
        width: 25px; /* Задайте нужную ширину */
        height: 25px; /* Задайте нужную высоту */
        border-radius: 20%; /* Делает изображение круглым */
        box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1); /* Добавляет тень */
    }

    .gamePair__timeFrameDifference {
        position: absolute;
        z-index: 1;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        height: 12px;
        font-size: 10px;
        background-color: #ffffff;
        transition: background-color 3s;
        border: 1px solid #000000;
        border-radius: 3px;
        padding: 0 4px;
    }

    .center {
        text-align: center; /* Для горизонтального центрирования текста */
        vertical-align: middle; /* Для вертикального центрирования текста */
    }

  </style>
  