FROM node:25-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /usr/src/app/data

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
