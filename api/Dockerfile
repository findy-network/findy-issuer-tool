
FROM node:18.17-alpine3.18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV production

RUN npm run build:production

FROM node:18.17-alpine3.18

ARG ISSUER_TOOL_SERVER_CERT_PATH

WORKDIR /usr/src/app

COPY package*.json ./

ENV NODE_ENV production
ENV FINDY_CTS_LOG_LEVEL debug
ENV ISSUER_TOOL_SERVER_CERT_PATH ${ISSUER_TOOL_SERVER_CERT_PATH}

RUN npm ci --only=production

COPY --from=0 /usr/src/app/build /usr/src/app/build
COPY --from=0 /usr/src/app/config /usr/src/app/config
COPY --from=0 /usr/src/app/tools /usr/src/app/tools

EXPOSE 3001

CMD ["npm", "run", "start:production"]
