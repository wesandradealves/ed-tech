FROM node:20-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port ${VITE_HOST_PORT:-5173}"]
