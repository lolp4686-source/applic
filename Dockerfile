FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx expo export --platform web

# ---------------------------------------------------
# Serveur Nginx léger pour servir le build statique
# ---------------------------------------------------
FROM nginx:alpine

# Config Nginx optimisée pour SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build web
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
