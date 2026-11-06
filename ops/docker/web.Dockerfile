FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
RUN pnpm install --no-frozen-lockfile
COPY apps/web apps/web
COPY packages packages
ENV NEXT_OUTPUT=standalone
RUN pnpm --filter @tamalate/web build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./.next/static
COPY --from=build /app/apps/web/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
