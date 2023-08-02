FROM node:16.20.0

RUN mkdir /app
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
RUN npm install -g pm2
COPY . .
RUN npm run build

CMD [ "pm2-runtime", "start", "node dist/entry.js" ]