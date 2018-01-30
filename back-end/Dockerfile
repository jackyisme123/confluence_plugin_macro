FROM node:9.3.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app
EXPOSE 4941

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV NODE_ENV=production

CMD [ "node", "app.js" ]
