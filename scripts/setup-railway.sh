#!/bin/bash

# Railway.com Project Setup Script
# This script helps initialize Railway projects for the Nx Starter application

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

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Installing..."
        npm install -g @railway/cli
        print_success "Railway CLI installed"
    else
        print_success "Railway CLI found"
    fi
}

# Login to Railway
login_to_railway() {
    if ! railway whoami &> /dev/null; then
        print_warning "Not logged in to Railway. Please login now..."
        railway login
    else
        RAILWAY_USER=$(railway whoami)
        print_success "Logged in as: $RAILWAY_USER"
    fi
}

# Create Railway project
create_railway_project() {
    local project_name=$1
    local service_type=$2
    
    print_status "Creating Railway project: $project_name"
    
    # Create new project
    railway init --name "$project_name"
    
    print_success "Created Railway project: $project_name"
    
    # Add PostgreSQL database for API projects
    if [ "$service_type" = "api" ]; then
        print_status "Adding PostgreSQL database..."
        railway add postgresql
        print_success "PostgreSQL database added"
    fi
}

# Set environment variables
set_environment_variables() {
    local env_file=$1
    local project_name=$2
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"
        return 1
    fi
    
    print_status "Setting environment variables from $env_file..."
    
    # Read environment file and set variables
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! "$key" =~ ^#.*$ ]] && [[ -n "$key" ]] && [[ -n "$value" ]]; then
            # Remove any quotes from value
            value=$(echo "$value" | sed 's/^"//;s/"$//')
            
            # Skip Railway-specific variables that are auto-set
            if [[ ! "$key" =~ ^RAILWAY_.*$ ]] && [[ ! "$key" =~ ^DATABASE_URL$ ]]; then
                echo "Setting $key=$value"
                railway variables set "$key=$value"
            fi
        fi
    done < "$env_file"
    
    print_success "Environment variables set for $project_name"
}

# Main setup function
setup_railway_projects() {
    local environment=${1:-production}
    
    print_status "🚀 Setting up Railway projects for Nx Starter"
    print_status "Environment: $environment"
    echo ""
    
    # Check prerequisites
    check_railway_cli
    login_to_railway
    
    echo ""
    print_status "This script will create the following Railway projects:"
    echo "  1. nx-starter-api-$environment (API Service)"
    echo "  2. nx-starter-web-$environment (Web Application)"
    echo ""
    
    # Confirm setup
    print_warning "Do you want to continue? (y/N)"
    read -r confirmation
    if [ "$confirmation" != "y" ] && [ "$confirmation" != "Y" ]; then
        print_status "Setup cancelled"
        exit 0
    fi
    
    # Determine environment files
    if [ "$environment" = "staging" ]; then
        API_ENV_FILE="railway-api-staging.env"
        WEB_ENV_FILE="railway-web-staging.env"
    else
        API_ENV_FILE="railway-api.env"
        WEB_ENV_FILE="railway-web.env"
    fi
    
    # Setup API project
    echo ""
    print_status "📡 Setting up API project..."
    API_PROJECT_NAME="nx-starter-api-$environment"
    
    # Create temporary directory for API project
    mkdir -p "/tmp/railway-setup/api"
    cd "/tmp/railway-setup/api"
    
    create_railway_project "$API_PROJECT_NAME" "api"
    
    # Set environment variables
    if [ -f "../../$API_ENV_FILE" ]; then
        set_environment_variables "../../$API_ENV_FILE" "$API_PROJECT_NAME"
    else
        print_warning "API environment file not found: $API_ENV_FILE"
        print_warning "You'll need to set environment variables manually"
    fi
    
    # Get project details
    API_PROJECT_ID=$(railway status --json | jq -r '.project.id // "unknown"')
    print_success "API project created: $API_PROJECT_NAME (ID: $API_PROJECT_ID)"
    
    # Setup Web project
    echo ""
    print_status "🌐 Setting up Web project..."
    WEB_PROJECT_NAME="nx-starter-web-$environment"
    
    # Create temporary directory for Web project
    mkdir -p "/tmp/railway-setup/web"
    cd "/tmp/railway-setup/web"
    
    create_railway_project "$WEB_PROJECT_NAME" "web"
    
    # Set environment variables
    if [ -f "../../$WEB_ENV_FILE" ]; then
        set_environment_variables "../../$WEB_ENV_FILE" "$WEB_PROJECT_NAME"
    else
        print_warning "Web environment file not found: $WEB_ENV_FILE"
        print_warning "You'll need to set environment variables manually"
    fi
    
    # Get project details
    WEB_PROJECT_ID=$(railway status --json | jq -r '.project.id // "unknown"')
    print_success "Web project created: $WEB_PROJECT_NAME (ID: $WEB_PROJECT_ID)"
    
    # Cleanup
    cd ../../..
    rm -rf "/tmp/railway-setup"
    
    # Summary
    echo ""
    print_success "🎉 Railway setup completed!"
    echo ""
    print_status "Created Projects:"
    echo "  - API Service: $API_PROJECT_NAME (ID: $API_PROJECT_ID)"
    echo "  - Web App: $WEB_PROJECT_NAME (ID: $WEB_PROJECT_ID)"
    echo ""
    print_status "Next Steps:"
    echo "  1. Review and update environment variables in Railway dashboard"
    echo "  2. Set JWT_SECRET in Railway secrets (not environment variables)"
    echo "  3. Connect GitHub repository for auto-deployments"
    echo "  4. Run initial deployment: ./scripts/deploy-railway.sh"
    echo "  5. Test health checks and functionality"
    echo ""
    print_status "Railway Dashboard: https://railway.app/dashboard"
    print_status "Documentation: docs/RAILWAY_DEPLOYMENT.md"
}

# Show usage information
show_usage() {
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  production  - Production environment (default)"
    echo "  staging     - Staging environment"
    echo ""
    echo "Examples:"
    echo "  $0              # Setup production projects"
    echo "  $0 production   # Setup production projects"
    echo "  $0 staging      # Setup staging projects"
    echo ""
    echo "This script will:"
    echo "  1. Install Railway CLI if needed"
    echo "  2. Login to Railway"
    echo "  3. Create Railway projects for API and Web"
    echo "  4. Add PostgreSQL database to API project"
    echo "  5. Set environment variables from config files"
}

# Parse command line arguments
ENVIRONMENT=${1:-production}

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
setup_railway_projects "$ENVIRONMENT"