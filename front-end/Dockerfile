FROM alpine:3.6

RUN apk add --no-cache nodejs nodejs-npm

RUN mkdir -p /usr/src/app1
WORKDIR /usr/src/app1

COPY package.json /usr/src/app1
RUN npm install

COPY . /usr/src/app1

#RUN npm run build
ENV NODE_ENV development
ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "run", "dev" ]
