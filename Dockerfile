# Runs this static site's build + full test suite in an isolated container
# — it does NOT serve or deploy the site. (For serving the site itself,
# see docker-compose.yml at the repo root.)
#
# Lets a reviewer (or CI) build and run this project's tests in complete
# isolation, with no local Node/npm install required.
#
#   docker build -t portfolio-check .
#   docker run --rm portfolio-check
#
# Runs the build and the full test suite; exits non-zero if either fails.

FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build
CMD ["npm", "test"]
