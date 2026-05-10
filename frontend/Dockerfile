FROM node:20-alpine

WORKDIR /app

# Copia e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o resto do código
COPY . .

# Compila o Next.js para produção
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]