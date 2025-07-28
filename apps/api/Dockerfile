# Use Node.js 20 LTS
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY libs/ ./libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build libraries and API
RUN pnpm run build:libs && pnpm run build:api

# Change to API output directory
WORKDIR /app/dist/apps/api

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1

# Start the application
CMD ["node", "main.js"]