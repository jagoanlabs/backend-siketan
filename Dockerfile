# Gunakan Node.js versi LTS
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000
CMD ["node", "src/index.js"]
