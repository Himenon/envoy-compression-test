FROM node:16.13.1-alpine AS BUILDER

ENV PORT 80

WORKDIR /app
COPY . /app
RUN yarn install
EXPOSE 80/tcp
# CMD ["node", "/app/server.js"]
# CMD ["yarn", "start"]
