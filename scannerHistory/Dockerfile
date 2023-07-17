FROM node:latest

WORKDIR /app

COPY scannerHistory/package.json scannerHistory/package-lock.json ./
RUN npm install

COPY scannerHistory/ ./
RUN npx knex migrate:latest

CMD ["node", "main.js"]