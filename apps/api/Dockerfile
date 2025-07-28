# Multi-stage build for Node.js API service
FROM node:20-alpine AS base

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Create app directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy all source code for dependency resolution
COPY libs ./libs
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application and its dependencies
RUN pnpm build:libs
RUN pnpm build:api

# Production stage
FROM node:20-alpine AS production

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

# Copy package.json from built API
COPY --from=base /app/dist/apps/api/package.json ./package.json
COPY --from=base /app/dist/apps/api/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=base /app/dist/apps/api ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S api -u 1001
USER api

# Expose port (Railway will provide PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 4000) + '/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "main.js"]