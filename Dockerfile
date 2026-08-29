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
