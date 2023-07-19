FROM node:latest

WORKDIR /app

COPY site/live.sport/server/package.json site/live.sport/server/package-lock.json ./
RUN npm install

COPY site/live.sport/server/ ./

CMD ["node", "server.js"]