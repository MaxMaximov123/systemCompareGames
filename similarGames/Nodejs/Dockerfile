FROM node:19.5.0

WORKDIR /app

COPY similarGames/Nodejs/package.json similarGames/Nodejs/package-lock.json ./
RUN npm install

COPY similarGames/Nodejs/ ./

# "--max-old-space-size=5120"
CMD ["node", "--max-old-space-size=64000", "main.js"]