FROM node:latest

WORKDIR /app

COPY scannerHistory/package.json scannerHistory/package-lock.json ./
RUN npm install
RUN npm i -g knex

COPY scannerHistory/ ./
RUN sleep 20 && knex migrate:latest --esm



CMD ["node", "main.js"]