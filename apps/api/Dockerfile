# Railway API Dockerfile
# Multi-stage build for production deployment

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm@10.13.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy all source code and configuration
COPY apps/ apps/
COPY libs/ libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm run build:libs && pnpm run build:api

# Stage 2: Production stage
FROM node:20-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S railway -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=railway:nodejs /app/dist/apps/api ./
COPY --from=builder --chown=railway:nodejs /app/dist/libs ./libs

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Switch to non-root user
USER railway

# Expose the port (Railway will set PORT env var)
EXPOSE ${PORT:-4000}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-4000}/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "main.js"]