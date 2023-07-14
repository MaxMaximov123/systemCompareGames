FROM node:latest

WORKDIR /app

COPY scannerHistory/package.json scannerHistory/package-lock.json ./
RUN npm install

COPY scannerHistory/ ./

CMD ["node", "main.js"]