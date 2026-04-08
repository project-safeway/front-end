FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL=/api
ARG VITE_API_FINANCEIRO_URL=/api/financeiro
ARG VITE_GOOGLE_MAPS_API_KEY=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_FINANCEIRO_URL=${VITE_API_FINANCEIRO_URL}
ENV VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
