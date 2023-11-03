FROM node:slim as build

WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM node:slim as final
WORKDIR /app
COPY ./outputs.json ./outputs.json
COPY ./package.json ./package.json
COPY --from=build /app/dist /app/dist
RUN npm install --omit dev

EXPOSE 21000/udp
EXPOSE 21000/tcp
EXPOSE 21001/udp
CMD [ "node", "dist/main.js"]