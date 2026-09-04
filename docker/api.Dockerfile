FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY services/api/package.json services/api/package.json
COPY packages/db/package.json packages/db/package.json
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN pnpm --filter @news/api build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo/services/api/dist ./dist
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/services/api/package.json ./
CMD ["node", "dist/main.js"]
