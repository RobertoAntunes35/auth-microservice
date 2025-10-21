# Etapa 1 - Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas os arquivos essenciais para instalar dependências
COPY package*.json ./

COPY ./shared-lib-1.0.0.tgz ./shared-lib-1.0.0.tgz
RUN npm install

# Agora copiar o restante do código (exceto node_modules por causa do .dockerignore)
COPY . .

# RUN npm run build

# Etapa 2 - Produção
# FROM node:20-alpine AS production

# WORKDIR /app
# COPY package*.json ./
# COPY ./shared-lib-1.0.0.tgz ./shared-lib-1.0.0.tgz
# RUN npm install --only=production

# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
