# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads/profiles

# Exponer puerto
EXPOSE 5000

# Comando para iniciar
CMD ["node", "server.js"]