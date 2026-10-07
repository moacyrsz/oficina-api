# Estagio de build: compila o TypeScript para JavaScript
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Estagio de execucao: imagem enxuta apenas com dependencias de producao
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Executa o seed do usuario administrador e sobe a aplicacao
CMD ["sh", "-c", "node dist/database/seeds/run-seed.js && node dist/main.js"]
