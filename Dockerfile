# --- Stage 1: build the static site ---
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Build the production bundle.
COPY . .
RUN npm run build

# --- Stage 2: serve with nginx (no Node at runtime) ---
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
