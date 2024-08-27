FROM node:18.17.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN npm run build-ts

EXPOSE 5000

CMD ["npm", "start"]