# ============================================================
# Stage 1: Build H5 Frontend
# ============================================================
FROM node:18-alpine AS build-h5

WORKDIR /build

# Copy H5 frontend package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy H5 frontend source
COPY src/ src/
COPY public/ public/
COPY index.html vite.config.js ./

# Build H5 frontend
RUN npm run build

# ============================================================
# Stage 2: Build Admin Frontend
# ============================================================
FROM node:18-alpine AS build-admin

WORKDIR /build

# Copy admin frontend package files
COPY admin/package.json admin/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy admin frontend source
COPY admin/src/ src/
COPY admin/index.html admin/vite.config.js ./
COPY admin/public/ public/

# Build admin frontend
RUN npm run build

# ============================================================
# Stage 3: Production
# ============================================================
FROM node:18-alpine AS production

# Add labels
LABEL maintainer="DaDa Entertainment Platform"
LABEL description="H5 Entertainment Platform - Production Image"

# Create app directory
WORKDIR /app

# Install production dependencies for admin-server
COPY admin-server/package.json admin-server/package-lock.json* ./admin-server/
RUN cd admin-server && npm install --omit=dev

# Copy admin-server source
COPY admin-server/server.js admin-server/db.js admin-server/h5-routes.js admin-server/pp-integration.js admin-server/pp-routes.js admin-server/validation.js admin-server/seed.js ./admin-server/

# Copy built frontends from build stages
COPY --from=build-h5 /build/dist ./dist
COPY --from=build-admin /build/dist ./admin/dist

# Copy static assets needed at runtime
COPY public/ ./public/

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start server
CMD ["node", "admin-server/server.js"]
