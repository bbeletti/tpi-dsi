FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS dependencies
COPY package*.json ./
RUN npm ci

FROM base AS development
COPY package*.json ./
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development
CMD ["npm", "run", "start:dev"]

FROM development AS builder
RUN npm run build
RUN npm prune --production

FROM base AS runner
ENV NODE_ENV=production
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY .env ./

EXPOSE 8000
CMD ["npm", "run", "start:prod"]
