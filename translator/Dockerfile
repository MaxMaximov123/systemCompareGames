FROM node:latest

WORKDIR /app

COPY translator/package.json translator/package-lock.json ./
RUN npm install
RUN npm i -g knex

COPY translator/ ./

CMD ["node", "main.js"]