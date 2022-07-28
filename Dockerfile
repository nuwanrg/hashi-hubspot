FROM node:16-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . ./
RUN yarn build
ENV PORT=3001
EXPOSE 3001
CMD [ "npm", "run", "start:prod" ]

