# ----------- Build Stage -----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build TypeScript
RUN npm run build


# ----------- Production Stage -----------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only package files for installing prod dependencies
COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist



EXPOSE 7000

CMD ["node", "dist/server.js"]
