FROM node AS builder
WORKDIR /tmp/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /tmp/app/dist ./dist
CMD [ "node", "dist/index.js" ]