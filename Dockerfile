# Stage 1: build da aplicação (todas as dependências isoladas no container)
FROM node:22-alpine AS builder

WORKDIR /app

# Variável de ambiente para a API (Vite embute em build time)
ENV VITE_API_BASE_URL=https://pet-manager-api.geia.vip

# Copiar apenas arquivos de dependência para aproveitar cache de camadas
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fonte e gerar build
COPY . .
RUN npm run build

# Stage 2: servir artefato com nginx (imagem final enxuta)
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
