# 1) Build the React app
FROM node:22-slim AS web
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN npm run build

# 2) API + built app in one small image (this is what Cloud Run runs)
FROM node:22-slim
WORKDIR /app/server
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server ./
COPY --from=web /app/server/public ./public
CMD ["node", "src/index.js"]
