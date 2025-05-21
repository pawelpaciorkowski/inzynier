# 1. Buduj aplikację (npm run build)
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# 2. Serwuj przez nginx (lub inny serwer statyczny)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Dodatkowo: własny nginx.conf? Skopiuj go (opcjonalnie)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
