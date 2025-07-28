#!/bin/sh

# Nginx startup script for Railway deployment
# Handles dynamic PORT configuration

set -e

# Default port
DEFAULT_PORT=3000
PORT=${PORT:-$DEFAULT_PORT}

echo "Starting nginx on port $PORT"

# Update nginx configuration with the correct port
sed -i "s/listen 3000;/listen $PORT;/" /etc/nginx/nginx.conf

# Validate nginx configuration
nginx -t

# Start nginx
exec nginx -g "daemon off;"