# Multi-stage build for React PWA static site
FROM node:20-alpine AS builder

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Create app directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy all source code for dependency resolution
COPY libs ./libs
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application and its dependencies
RUN pnpm build:libs
RUN pnpm build:web

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

# Copy built static files
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html

# Copy entrypoint script
COPY apps/web/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-user
RUN adduser -S app -u 1001 -G nginx-user

# Change ownership of necessary directories
RUN chown -R app:nginx-user /usr/share/nginx/html
RUN chown -R app:nginx-user /var/cache/nginx
RUN chown -R app:nginx-user /var/log/nginx
RUN touch /var/run/nginx.pid
RUN chown app:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER app

# Expose port (Railway will provide PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-80}/ || exit 1

# Start nginx with custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]