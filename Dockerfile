# syntax=docker/dockerfile:1.7
#
# Smart News Aggregator — Web UI
#
# Multi-stage. Three targets you can build:
#   dev      hot-reloading Vite server        --target dev
#   runtime  nginx serving the static build   (default)
#   test     runs the verify gate             --target test
#
# The critical thing to understand: this is a Vite SPA, so VITE_* variables are
# baked into the bundle at BUILD time. They are not runtime configuration and
# they are not secret — they end up in JavaScript the browser downloads. What
# *is* configurable at runtime is where nginx proxies /api to, via
# API_PROXY_TARGET.

ARG NODE_VERSION=22

# ---------------------------------------------------------------------------
# deps — resolved once, reused by every downstream stage
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app

# Only the manifests, so this layer caches until dependencies actually change.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ---------------------------------------------------------------------------
# dev — hot reload. Source is bind-mounted over /app by compose.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5173
# --host 0.0.0.0 is required: Vite binds localhost by default, which inside a
# container means the container's own loopback and is unreachable from the host.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------------------------------------------------------------------------
# build — typecheck + production bundle
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

# Default /api means the browser calls the same origin and nginx proxies it.
# Override to an absolute URL to call Django directly — that origin must then be
# in CORS_ALLOWED_ORIGINS on the backend.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `npm run build` is `tsc -b && vite build` — a type error fails the image.
RUN npm run build

# ---------------------------------------------------------------------------
# test — the same gate CI runs. Not part of the runtime chain.
#   docker build --target test .
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS test
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run verify

# ---------------------------------------------------------------------------
# runtime — nginx serving the static build
#
# nginx-unprivileged rather than the official image: it runs as uid 101 and
# listens on 8080, so nothing in this container needs root.
# ---------------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Where nginx forwards /api. Point at the Django origin.
#   Django on the host   -> http://host.docker.internal:8000
#   Django in a container -> http://<service-name>:8000
ENV API_PROXY_TARGET=http://host.docker.internal:8000

# Templates in this directory get envsubst'd into /etc/nginx/conf.d at startup,
# which is how API_PROXY_TARGET becomes runtime configuration.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Restrict substitution to our own variable. Without this, envsubst would also
# eat any ${...} that happens to appear in the template.
ENV NGINX_ENVSUBST_FILTER=API_PROXY_TARGET

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
