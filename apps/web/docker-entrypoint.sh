#!/bin/sh

# Replace PORT placeholder in nginx config with actual PORT environment variable
# Default to port 80 if PORT is not set
export PORT=${PORT:-80}

# Use envsubst to replace ${PORT} in nginx.conf
envsubst '${PORT}' < /etc/nginx/nginx.conf > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/nginx.conf

# Log the port being used
echo "Starting nginx on port ${PORT}"

# Execute the main command
exec "$@"