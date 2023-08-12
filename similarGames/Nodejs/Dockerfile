FROM node:latest

WORKDIR /app

COPY similarGames/Nodejs/package.json similarGames/Nodejs/package-lock.json ./
RUN npm install

COPY similarGames/Nodejs/ ./

CMD ["node", "--max-old-space-size=8192", "main.js"]