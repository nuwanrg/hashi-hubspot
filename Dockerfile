FROM node:16.10.0
WORKDIR /app
COPY package.json yarn.lock /app
RUN yarn install
COPY . /app
EXPOSE 3000
CMD npm run start:prod
