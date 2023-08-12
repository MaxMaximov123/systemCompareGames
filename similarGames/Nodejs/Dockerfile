FROM node:18

WORKDIR /app

COPY similarGames/Nodejs/package.json similarGames/Nodejs/package-lock.json ./
RUN npm install

COPY similarGames/Nodejs/ ./

# "--max-old-space-size=5120"
CMD ["node", "--max-old-space-size=12000", "main.js"]