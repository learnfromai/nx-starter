#!/bin/bash

# Railway.com Complete Deployment Script
# This script deploys both API and Web applications to Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Main deployment function
deploy_to_railway() {
    local service_type=$1
    local environment=${2:-production}
    
    print_status "🚀 Starting Railway deployment for $service_type ($environment)..."

    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi

    # Check if logged in to Railway
    if ! railway whoami &> /dev/null; then
        print_warning "Not logged in to Railway. Please run 'railway login' first."
        railway login
    fi

    # Build the application
    print_status "📦 Building application..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        pnpm install --frozen-lockfile
    fi

    # Build libraries first
    print_status "Building libraries..."
    pnpm run build:libs

    if [ "$service_type" = "api" ]; then
        # Build API
        print_status "Building API..."
        pnpm run build:api

        # Validate API build
        if [ ! -d "dist/apps/api" ] || [ ! -f "dist/apps/api/main.js" ]; then
            print_error "API build failed"
            exit 1
        fi

        print_success "API build successful"

        # Deploy API
        print_status "🚢 Deploying API to Railway..."
        cd apps/api
        
        # Set Railway service name
        export RAILWAY_SERVICE="nx-starter-api-$environment"
        
        # Deploy with Docker
        railway up --detach --service "$RAILWAY_SERVICE"
        
        cd ../..
        
        print_success "API deployment initiated"

    elif [ "$service_type" = "web" ]; then
        # Build Web
        print_status "Building Web application..."
        pnpm run build:web

        # Validate Web build
        if [ ! -d "dist/apps/web" ] || [ ! -f "dist/apps/web/index.html" ]; then
            print_error "Web build failed"
            exit 1
        fi

        print_success "Web build successful"

        # Deploy Web
        print_status "🚢 Deploying Web to Railway..."
        cd apps/web
        
        # Set Railway service name
        export RAILWAY_SERVICE="nx-starter-web-$environment"
        
        # Deploy with Docker
        railway up --detach --service "$RAILWAY_SERVICE"
        
        cd ../..
        
        print_success "Web deployment initiated"

    elif [ "$service_type" = "both" ]; then
        # Deploy both services
        print_status "Deploying both API and Web services..."
        
        # Deploy API first
        deploy_to_railway "api" "$environment"
        
        # Wait a bit between deployments
        sleep 5
        
        # Deploy Web
        deploy_to_railway "web" "$environment"
        
        return 0
    else
        print_error "Invalid service type. Use 'api', 'web', or 'both'"
        exit 1
    fi

    # Show deployment info
    print_status "📱 Deployment Information:"
    echo "  - Check status: railway status --service $RAILWAY_SERVICE"
    echo "  - View logs: railway logs --service $RAILWAY_SERVICE"
    echo "  - Open service: railway open --service $RAILWAY_SERVICE"
    
    print_success "Deployment completed for $service_type"
}

# Show usage information
show_usage() {
    echo "Usage: $0 [service] [environment]"
    echo ""
    echo "Services:"
    echo "  api     - Deploy API service only"
    echo "  web     - Deploy Web application only"
    echo "  both    - Deploy both services (default)"
    echo ""
    echo "Environments:"
    echo "  production  - Production environment (default)"
    echo "  staging     - Staging environment"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy both services to production"
    echo "  $0 api               # Deploy API to production"
    echo "  $0 web staging       # Deploy Web to staging"
    echo "  $0 both staging      # Deploy both to staging"
}

# Parse command line arguments
SERVICE_TYPE=${1:-both}
ENVIRONMENT=${2:-production}

# Validate environment
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    print_error "Invalid environment. Use 'production' or 'staging'"
    show_usage
    exit 1
fi

# Show help if requested
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_usage
    exit 0
fi

# Main execution
print_status "🎯 Nx Starter Railway Deployment"
print_status "Service: $SERVICE_TYPE"
print_status "Environment: $ENVIRONMENT"
echo ""

# Confirm deployment
if [ "$ENVIRONMENT" = "production" ]; then
    print_warning "You are about to deploy to PRODUCTION. Are you sure? (y/N)"
    read -r confirmation
    if [ "$confirmation" != "y" ] && [ "$confirmation" != "Y" ]; then
        print_status "Deployment cancelled"
        exit 0
    fi
fi

# Start deployment
deploy_to_railway "$SERVICE_TYPE" "$ENVIRONMENT"

print_success "🎉 All deployments completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Verify deployments are healthy"
echo "2. Run smoke tests against deployed services"
echo "3. Update DNS/CDN if needed"
echo "4. Monitor logs for any issues"