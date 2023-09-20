<template>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
    <v-container v-if="modalDecisions.isOpen">
      <modal :value="modalDecisions.isOpen" :title="modalDecisions.title" @closeModal="closeModal" style="width: 70%;">
        <table style="font-size: 80%; border-collapse: collapse;">
            <thead class="headers" style="top: 0; position: sticky;">
                <th>ID</th>
                <th>Начало</th>
                <th>Сходство начала</th>
                <th>Названия</th>
                <th>Пре-кэфы.</th>
                <th>Лайв-кэфы.</th>
                <th>Счет</th>
                <th style="width: 5%;">Новой системой?</th>
                <th style="width: 5%;">Старой системой?</th>
                <th>Создана</th>
            </thead>
            <tbody v-for="decision in modalDecisions.data">
                <tr>
                    <td rowspan="2">{{ decision.id }}</td>
                    <td>
                        <p style="font-size: 100%;" v-for="time of formatDateFromUnixTimestampStr(decision.game1StartTime).split('*')">{{ time ? time : 'Неизвестно' }}</p>
                    </td>
                    <td rowspan="2">{{ round(decision.timeDiscrepancy) }}%</td>
                    <td rowspan="2">{{ round(decision.similarityNames) }}%</td>
                    <td rowspan="2">{{ round(decision.similarityOutcomesPre) }}%</td>
                    <td rowspan="2">{{ round(decision.similarityOutcomesLive) }}%</td>
                    <td rowspan="2">{{ round(decision.similarityScores) }}%</td>
                    <td rowspan="2">{{ decision.needGroup ? 'Да' : 'Нет' }}</td>
                    <td rowspan="2">{{ decision.grouped ? 'Да' : 'Нет' }}</td>
                    <td rowspan="2">
                        <!-- {{ new Date(decision.createdAt) }} -->
                        <p v-for="time of formatDateFromUnixTimestampStr(decision.createdAt).split('*')">{{ time }}</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p style="font-size: 100%;" v-for="time of formatDateFromUnixTimestampStr(decision.game2StartTime).split('*')">{{ time ? time : 'Неизвестно' }}</p>
                    </td>
                </tr>
                
            </tbody>
        </table>
      </modal>
    </v-container>
    <v-container v-if="modalTeamNames.isOpen">
      <modal :value="modalTeamNames.isOpen" :title="modalTeamNames.title" @closeModal="closeModal" style="width: 30%;">
        <table style="font-size: 80%; border-collapse: collapse; width: 100%;">
            <thead class="headers" style="top: 0; position: sticky;">
                <th>ID</th>
                <th>Команда 1</th>
                <th>Команда 2</th>
                <th>Создана</th>
            </thead>
            <tbody v-for="teamName in modalTeamNames.data">
                <tr>
                    <td>{{ teamName.id }}</td>
                    <td>
                        {{ teamName.team1Name }}
                    </td>
                    <td>
                        {{ teamName.team2Name }}
                    </td>
                    <td>
                        <p v-for="time of formatDateFromUnixTimestampStr(teamName.time).split('*')">{{ time }}</p>
                    </td>
                </tr>
            </tbody>
        </table>
      </modal>
    </v-container>
    <v-container>
      <modal :value="modalStartTime.isOpen" :title="modalStartTime.title" @closeModal="closeModal" style="width: 30%">
        <table style="font-size: 80%; border-collapse: collapse; width: 100%;">
            <thead class="headers" style="top: 0; position: sticky;">
                <th>ID</th>
                <th>Начало</th>
                <th>Создана</th>
            </thead>
            <tbody v-for="startTime in modalStartTime.data">
                <tr>
                    <td>{{ startTime.id }}</td>
                    <td>
                        <p style="font-size: 100%;" v-for="time of formatDateFromUnixTimestampStr(startTime.startTime).split('*')">{{ time ? time : 'Неизвестно' }}</p>
                    </td>
                    <td>
                        <p v-for="time of formatDateFromUnixTimestampStr(startTime.time).split('*')">{{ time }}</p>
                    </td>
                </tr>
            </tbody>
        </table>
      </modal>
    </v-container>
    <table class="pairs">
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
            <th>Новой системой?</th>
            <th>Старой системой?</th>
            <th>Решения</th>
            <!-- <th>Создана</th> -->
            <th colspan="2">Обновлена</th>
        </thead>
        <tr class="none-tr"></tr>
        <tbody v-for="item in items" :key="item.id" class="data" :id="item.id">
            <tr>
                <td rowspan="2" class="num-pair" :style="{ backgroundColor: getBackgroundColor(item) }">
                    <v-icon @click="downloadImage(item.id)" class="download-link">mdi-download</v-icon>
                    Пара {{ item.id }}
                    <a v-if="item.hashistory1 !== null && item.hashistory2 !== null" :href="`../graphic/${item.id}/outcomesPre`" target="_blank" class="invisible-link"><i class="fas fa-chart-line"></i></a>
                </td>
                <td style="text-align: left; position: relative; border: 1px solid #000; padding-right: 20px;">
                    <v-icon :size="15" @click="copyToClipboard(item.game1Team1Name)" class="copy-name">mdi-content-copy</v-icon>
                    {{ item.game1Team1Name }}
                </td>
                <td style="text-align: left; position: relative; border: 1px solid #000; padding-left: 20px;">
                    <v-icon :size="15" @click="copyToClipboard(item.game1Team2Name)" class="copy-name">mdi-content-copy</v-icon>
                    {{ item.game1Team2Name }}
                    <div class="gamePair__teamNamesUpdates d-flex align-center" v-if="item.game1NamesUpdates > 1">
                        <v-icon class="copy-name" size="large" @click="openModalTeamNames(item.game1Id)">mdi-history</v-icon>
                        {{ item.game1NamesUpdates }}
                    </div>
                </td>
                <td rowspan="2">
                    {{ item.sportKey }}
                </td>
                <td>
                    <img class="bookie-icon" :src="'/bookie-icons/' + item.bookieKey1 + '.png'">
                </td>
                <td>
                    <p v-for="time of ( Number(item.startTime1) || Number(item.liveFrom1) ? formatDateFromUnixTimestamp(Number(item.startTime1) || Number(item.liveFrom1)) : 'Неизвестно').split('*')">{{ time }}</p>
                    <div v-if="item.game1StartTimeUpdates > 1">
                        <v-icon class="copy-name" size="medium" @click="openModalStartTime(item.game1Id)">mdi-history</v-icon>
                        {{ item.game1StartTimeUpdates }}
                    </div>
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
                    <v-icon class="copy-name" @click="openModalDecisions(item.id)">mdi-history</v-icon>
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
                <td style="text-align: left; position: relative; border: 1px solid #000; padding-right: 20px;">
                    <v-icon :size="15" @click="copyToClipboard(item.game2Team1Name)" class="copy-name">mdi-content-copy</v-icon>
                    {{ item.game2Team1Name }}                    
                </td>
                <td style="text-align: left; position: relative; border: 1px solid #000; padding-left: 20px;">
                    <v-icon :size="15" @click="copyToClipboard(item.game2Team2Name)" class="copy-name">mdi-content-copy</v-icon>
                    {{ item.game2Team2Name }}                
                    <div class="gamePair__teamNamesUpdates d-flex align-center" v-if="item.game2NamesUpdates > 1">
                        <v-icon class="copy-name" size="large" @click="openModalTeamNames(item.game2Id)">mdi-history</v-icon>
                        {{ item.game2NamesUpdates }}
                    </div>
                    <div class="gamePair__copyNamesObject d-flex align-center" style="">
                        <v-icon :size="15" @click="copyToClipboard(JSON.stringify({
                            game1: {
                                name1: item.game1Team1Name,
                                name2: item.game1Team2Name,
                                bookieKey: item.bookieKey1,
                            },
                            game2: {
                                name1: item.game2Team1Name,
                                name2: item.game2Team2Name,
                                bookieKey: item.bookieKey2,
                            }
                        }))" class="copy-name">mdi-content-copy</v-icon>
                    </div>
                </td>
                <td>
                    <img class="bookie-icon" :src="'/bookie-icons/' + item.bookieKey2 + '.png'">
                </td>
                <td style="position: relative; width: 10%; border: 1px solid #000"
                class="py-1 px-2 text-center text-no-wrap text-caption">
                    <p v-for="time of ( Number(item.startTime2) || Number(item.liveFrom2) ? formatDateFromUnixTimestamp(Number(item.startTime2) || Number(item.liveFrom2)) : 'Неизвестно').split('*')">{{ time }}</p>
                    <div v-if="item.game2StartTimeUpdates > 1">
                        <v-icon class="copy-name" size="medium" @click="openModalStartTime(item.game2Id)">mdi-history</v-icon>
                        {{ item.game2StartTimeUpdates }}
                    </div>
                </td>
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
  </template>
  
  <script>
  import html2canvas from 'html2canvas';
  import Modal from "@/components/Modal.vue";
  import moment from 'moment';
  export default {
    props: {
        items: {
            type: Object,
            required: true
        }
    },
    components: {
        Modal
    },

    data() {
      return {
        textX: 0,
        textY: 0,
        isHovered: false,
        apiHost: 0 ? 'localhost:8005' : '195.201.58.179:8005',
        modalDecisions: {
            title: '',
            isOpen: false,
        },
        modalTeamNames: {
            title: '',
            isOpen: false,
        },
        modalStartTime: {
            title: '',
            isOpen: false,
        },
      };
    },

    mounted(){
    },
    
    methods: {
        round (num){
            return Math.floor(num * 100 * 100) / 100;
        },
        async openModalDecisions(pairId) {
            this.modalDecisions.data = (await this.postRequest(`http://${this.apiHost}/api/decisions`, {pairId: pairId})).data;
            this.modalDecisions.isOpen = true;
            this.modalDecisions.title = `Решения ${pairId}`
        },
        async openModalTeamNames(gameId) {
            this.modalTeamNames.data = (await this.postRequest(`http://${this.apiHost}/api/teamNames`, {gameId: gameId})).data;
            this.modalTeamNames.isOpen = true;
            this.modalTeamNames.title = `Названия ${gameId}`
        },

        async openModalStartTime(gameId) {
            this.modalStartTime.data = (await this.postRequest(`http://${this.apiHost}/api/startTime`, {gameId: gameId})).data;
            this.modalStartTime.isOpen = true;
            this.modalStartTime.title = `Время начала ${gameId}`
        },

        closeModal() {
            this.modalDecisions.isOpen = false;
            this.modalTeamNames.isOpen = false;
            this.modalStartTime.isOpen = false;
        },
        formatDateFromUnixTimestamp(unixTimestamp) {
            return moment(new Date(Number(unixTimestamp))).format(`DD.MM.YYYY*HH:mm:ss`);
        },
        formatDateFromUnixTimestampStr(unixTimestamp) {
            if (unixTimestamp) return moment(new Date(unixTimestamp)).format(`DD.MM.YYYY*HH:mm:ss`);
            else return '';
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
  };
  </script>
  <style>
    .pairs {
      font-size: 75%;
      margin-bottom: 20px;
      border-collapse: collapse;
      /* width: 80%; */
      /* flex-grow: 1; */
      /* max-width: 200px; Adjust as needed */
      /* margin: auto; */
      margin-left: 1%;
      margin-right: 1%;
    }

    .headers th, td {
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

    /* .data {
        margin-bottom: 10px;
    } */

    .num-pair {
        writing-mode: vertical-lr;
        transform: rotate(180deg);
        text-align: left;
        max-height: 150px;
    }


    .pairs td {
        /* background-color: #ffffff; Цвет фона ячеек данных */
        box-shadow: 0 2px 4px rgba(51, 51, 51, 0.1); /* Тень между ячейками */
    }

    .pairs th:first-child {
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
        height: 16px;
        font-size: 10px;
        background-color: #ffffff;
        transition: background-color 3s;
        border: 1px solid #000000;
        border-radius: 3px;
        padding: 0 4px;
    }

    .gamePair__copyNamesObject {
        position: absolute;
        z-index: 1;
        top: -6px;
        left: -2px;
        transform: translateX(-50%);
        height: 16px;
        font-size: 10px;
        background-color: #ffffff;
        transition: background-color 3s;
        border-radius: 3px;
        padding: 0 4px;
    }

    .gamePair__teamNamesUpdates {
        position: absolute;
        z-index: 1;
        left: -2px;
        top: 40%;
        transform: translateX(-50%);
        height: 16px;
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
  