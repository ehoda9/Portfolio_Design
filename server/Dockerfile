# Builds and runs the API in isolation.
#
#   docker build -t portfolio-api ./server
#   docker run --rm -p 3000:3000 portfolio-api
#
# (Once Phase 2 adds Postgres, use docker-compose at the repo root instead
# — it wires this service up with its database automatically.)

FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
