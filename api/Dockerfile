
FROM node:14.16.0-alpine3.13

ARG GITHUB_TOKEN
ARG ISSUER_TOOL_SERVER_CERT_PATH

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./

RUN npm install

COPY . .

ENV NODE_ENV production

RUN npm run build:production

FROM node:14.16.0-alpine3.13

ARG GITHUB_TOKEN
ARG ISSUER_TOOL_SERVER_CERT_PATH

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./

ENV NODE_ENV production
ENV FINDY_CTS_LOG_LEVEL debug

RUN npm ci --only=production

RUN rm .npmrc

COPY --from=0 /usr/src/app/build /usr/src/app/build
COPY --from=0 /usr/src/app/config /usr/src/app/config

EXPOSE 3001

CMD ["npm", "run", "start:production"]
