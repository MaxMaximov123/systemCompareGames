FROM node:latest

WORKDIR /app

COPY similarGames/Nodejs/package.json similarGames/Nodejs/package-lock.json ./
RUN npm install

COPY similarGames/Nodejs/ ./

# "--max-old-space-size=5120"
CMD ["node", "main.js"]