FROM node:16-alpine

WORKDIR /tmp/build

COPY package.json yarn.lock ./
RUN yarn && rm -rf /usr/local/share/.cache/yarn

COPY . .
RUN yarn build && mkdir -p /app && mv .env.example static dist node_modules /app && rm -rf /tmp/build && rm -rf /usr/local/share/.cache/yarn

WORKDIR /app

EXPOSE 3000
CMD [ "node", "dist" ]