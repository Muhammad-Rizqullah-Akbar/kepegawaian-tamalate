FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/policy-schema/package.json packages/policy-schema/
RUN pnpm install --no-frozen-lockfile
COPY apps/api apps/api
COPY packages packages
RUN pnpm --filter @tamalate/api build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/prisma ./prisma
USER node
EXPOSE 4000
CMD ["node", "dist/main.js"]
