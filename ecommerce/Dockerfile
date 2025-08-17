# Etapa 1: Instalação de dependências
FROM node:20-alpine AS deps

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de manifesto de pacotes para aproveitar o cache do Docker
COPY package*.json ./

# Instala as dependências. A flag --legacy-peer-deps é usada para
# garantir compatibilidade com a configuração do seu projeto.
RUN npm install --legacy-peer-deps

# Etapa 2: Build da aplicação (para um ambiente de produção)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Compila o código TypeScript para JavaScript
RUN npm run build

# A configuração do docker-compose usará o `start:dev` com volumes,
# mas esta imagem está pronta para ser estendida para produção.