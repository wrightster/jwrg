# Astro 5 SSR (@astrojs/node standalone) container image — for Coolify.
# Multi-stage: build with the full toolchain, run from a slim runtime.
#
# Why this exists / gotchas baked in:
#  - The repo's `npm start` binds HOST=127.0.0.1, which is fatal in a container
#    (the reverse proxy can't reach a loopback bind). We set HOST=0.0.0.0 below
#    and start entry.mjs directly instead of via `npm start`.
#  - @astrojs/node standalone does NOT bundle node_modules, so the runtime image
#    keeps them (copied from the build stage — no second install / network hop).
#  - @jw/shared is a public `github:` dependency, so `npm ci` needs git present
#    in the build stage (not needed at runtime).

# ---- build ----------------------------------------------------------------
FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime --------------------------------------------------------------
FROM node:22-slim AS runtime
WORKDIR /app
# curl is required by Coolify's health check, which runs INSIDE the container
# (`curl http://localhost:PORT/healthz`). node:22-slim ships neither curl nor
# wget, so without this the container is marked unhealthy and rolled back even
# though the server started fine. Keep it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
# Astro's node adapter reads HOST/PORT. Bind all interfaces so Coolify's proxy
# can reach the container; keep the port in sync with Coolify's "Ports Exposes".
ENV HOST=0.0.0.0
ENV PORT=4321
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
USER node
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
