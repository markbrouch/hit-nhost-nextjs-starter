FROM node:16

WORKDIR /app

COPY package.json package-lock.json .
RUN npm install

COPY tsconfig.json .
COPY src src/
RUN npm run build
