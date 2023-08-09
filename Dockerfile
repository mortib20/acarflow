FROM node:slim as build

WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npx tsc

FROM node:slim
COPY ./package.json ./package.json
COPY --from=build /app/dist /app/dist
RUN npm install --omit dev
WORKDIR /app/dist

EXPOSE 21000
EXPOSE 21001
CMD [ "node", "main.js"]