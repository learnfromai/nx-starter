# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY libs/ ./libs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build libraries and web app
RUN pnpm run build:libs && pnpm run build:web

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]