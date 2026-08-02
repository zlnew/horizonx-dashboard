# Production image for the HorizonX Dashboard.
# Builds the Vue SPA, serves it with nginx, proxies /api/* + WebSocket to the
# control-plane server (which is reachable at `server:3000` on the same
# compose network — see `horizonx setup`).
#
# Build (used by the release workflow):
#   docker build -t ghcr.io/zlnew/horizonx-dashboard:<tag> .
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL is only used by the Vite dev proxy; in production the SPA uses
# relative /api/* URLs and nginx proxies them.
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
