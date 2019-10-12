FROM node:alpine

WORKDIR /root/app
COPY . ./

RUN npm install
RUN npm run build
RUN npm prune --production