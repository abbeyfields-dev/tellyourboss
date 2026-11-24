FROM node:20-bookworm-slim AS build

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runner

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 8080

CMD ["./docker-entrypoint.sh"]
