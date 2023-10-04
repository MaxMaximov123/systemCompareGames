FROM node:latest

WORKDIR /app

COPY deleterOldGames/package.json deleterOldGames/package-lock.json ./
RUN npm install
RUN npm i -g knex

COPY deleterOldGames/ ./

# CMD ["node", "main.js"]