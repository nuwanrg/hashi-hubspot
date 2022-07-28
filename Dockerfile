FROM node:16.10.0
WORKDIR /app
COPY package.json yarn.lock /app
RUN yarn install
COPY . /app
ENV PORT=3001
EXPOSE 3001
CMD npm run start:prod
