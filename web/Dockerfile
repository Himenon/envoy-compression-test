FROM node:16.13.1-alpine AS BUILDER

WORKDIR /app
COPY . /app
RUN yarn install && yarn build

FROM node:16.13.1-alpine

WORKDIR /app

COPY --from=BUILDER /app/build/server.js /app/server.js

ENV PORT 80
ENV NODE_ENV production

EXPOSE 80/tcp

CMD ["node", "/app/server.js"]
