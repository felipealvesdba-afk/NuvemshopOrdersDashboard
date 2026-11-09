# Painel de pedidos (pedidos.lrflow.cloud) — VPS / Coolify
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --include=dev --no-audit --no-fund
COPY frontend/ ./
# mesma origem: o backend serve o painel e a API
ENV VITE_API_URL=""
RUN NODE_ENV=development npm run build

FROM node:20-alpine
RUN apk add --no-cache tzdata
WORKDIR /app
COPY backend/package*.json backend/
RUN cd backend && npm ci --omit=dev --no-audit --no-fund
COPY backend/ backend/
COPY --from=frontend /app/frontend/dist frontend/dist
ENV NODE_ENV=production PORT=4000 TZ=America/Sao_Paulo
EXPOSE 4000
CMD ["node", "backend/server.js"]
