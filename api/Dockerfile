
FROM node:16.13.2-alpine3.15

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./

RUN npm ci --legacy-peer-deps

COPY . .

ENV NODE_ENV production

RUN npm run build:production

FROM node:16.13.2-alpine3.15

ARG ISSUER_TOOL_SERVER_CERT_PATH

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./

ENV NODE_ENV production
ENV FINDY_CTS_LOG_LEVEL debug
ENV ISSUER_TOOL_SERVER_CERT_PATH ${ISSUER_TOOL_SERVER_CERT_PATH}

RUN npm ci --only=production --legacy-peer-deps

RUN rm .npmrc

COPY --from=0 /usr/src/app/build /usr/src/app/build
COPY --from=0 /usr/src/app/config /usr/src/app/config
COPY --from=0 /usr/src/app/tools /usr/src/app/tools

EXPOSE 3001

CMD ["npm", "run", "start:production"]
