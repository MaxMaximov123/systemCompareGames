FROM node:latest

WORKDIR /app

COPY scannerHistory/package.json scannerHistory/package-lock.json ./
RUN npm install
RUN npm i -g knex

COPY scannerHistory/ ./

RUN knex migrate:latest --esm"



CMD ["node", "main.js"]