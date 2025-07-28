# Railway Web Dockerfile  
# Multi-stage build for static site deployment

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
RUN pnpm run build:libs && pnpm run build:web

# Stage 2: Production stage with nginx
FROM nginx:alpine AS runtime

# Copy built application from builder stage
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html

# Copy custom nginx configuration and startup script
COPY apps/web/nginx.conf /etc/nginx/nginx.conf
COPY apps/web/start-nginx.sh /usr/local/bin/start-nginx.sh

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod +x /usr/local/bin/start-nginx.sh

# Create nginx.pid directory
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose the port (Railway will set PORT env var)
EXPOSE ${PORT:-3000}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/ || exit 1

# Start nginx with dynamic port configuration
CMD ["/usr/local/bin/start-nginx.sh"]