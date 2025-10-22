# Gunakan Node.js versi LTS
FROM oven/bun:alpine

WORKDIR /app

COPY package*.json ./
RUN bun install

COPY . .

EXPOSE 5000
CMD ["bun", "index.js"]
