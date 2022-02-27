FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

VOLUME [ "/usr/src/app/data" ]

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]