FROM alpine:3.6

RUN apk add --no-cache nodejs nodejs-npm

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app
EXPOSE 4941
CMD [ "npm", "start" ]