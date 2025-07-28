#!/bin/bash

# Railway Deployment Validation Script
# This script validates that the Railway deployment configuration is correct

set -e

echo "🚂 Railway Deployment Validation"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -f "nx.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Checking project structure..."

# Check required Railway configuration files
if [ -f "apps/api/railway.json" ]; then
    print_success "API Railway configuration found"
else
    print_error "apps/api/railway.json not found"
    exit 1
fi

if [ -f "apps/web/railway.json" ]; then
    print_success "Web Railway configuration found"
else
    print_error "apps/web/railway.json not found"
    exit 1
fi

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm first:"
    echo "  npm install -g pnpm"
    exit 1
fi

print_success "pnpm is available"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    pnpm install --frozen-lockfile
fi

print_success "Dependencies are installed"

# Test the build commands that Railway will use
print_status "Testing Railway build commands..."

# Test API build
print_status "Testing API build command..."
if pnpm install --frozen-lockfile && pnpm build:libs && pnpm build:api; then
    print_success "API build command succeeded"
else
    print_error "API build command failed"
    exit 1
fi

# Check if API main.js exists
if [ -f "dist/apps/api/main.js" ]; then
    print_success "API main.js exists"
else
    print_error "API main.js not found after build"
    exit 1
fi

# Test Web build
print_status "Testing Web build command..."
if pnpm install --frozen-lockfile && pnpm build:libs && pnpm build:web; then
    print_success "Web build command succeeded"
else
    print_error "Web build command failed"
    exit 1
fi

# Check if Web index.html exists
if [ -f "dist/apps/web/index.html" ]; then
    print_success "Web index.html exists"
else
    print_error "Web index.html not found after build"
    exit 1
fi

# Validate Railway JSON configurations
print_status "Validating Railway JSON configurations..."

# Check if jq is available for JSON validation
if command -v jq &> /dev/null; then
    if jq empty apps/api/railway.json 2>/dev/null; then
        print_success "API railway.json is valid JSON"
    else
        print_error "API railway.json is invalid JSON"
        exit 1
    fi
    
    if jq empty apps/web/railway.json 2>/dev/null; then
        print_success "Web railway.json is valid JSON"
    else
        print_error "Web railway.json is invalid JSON"
        exit 1
    fi
else
    print_warning "jq not available, skipping JSON validation"
fi

# Check GitHub Actions workflow
if [ -f ".github/workflows/deploy-railway.yml" ]; then
    print_success "Railway deployment workflow found"
else
    print_warning "Railway deployment workflow not found at .github/workflows/deploy-railway.yml"
fi

# Check environment examples
if [ -f "apps/api/.env.railway" ]; then
    print_success "API Railway environment example found"
else
    print_warning "API Railway environment example not found"
fi

if [ -f "apps/web/.env.railway" ]; then
    print_success "Web Railway environment example found"
else
    print_warning "Web Railway environment example not found"
fi

# Check documentation
if [ -f "docs/RAILWAY_DEPLOYMENT.md" ]; then
    print_success "Railway deployment documentation found"
else
    print_warning "Railway deployment documentation not found"
fi

print_status "Testing Node.js start command..."
# Test if the API can be started (just check syntax, don't actually start)
if node -c dist/apps/api/main.js; then
    print_success "API main.js syntax is valid"
else
    print_error "API main.js has syntax errors"
    exit 1
fi

echo ""
print_success "✅ All Railway deployment validations passed!"
echo ""
print_status "Next steps for Railway deployment:"
echo "  1. Create Railway projects for API and Web"
echo "  2. Configure GitHub secrets (RAILWAY_TOKEN, RAILWAY_API_PROJECT_ID, RAILWAY_WEB_PROJECT_ID)"
echo "  3. Set environment variables in Railway dashboard"
echo "  4. Push to main branch to trigger deployment"
echo ""
print_status "📚 See docs/RAILWAY_DEPLOYMENT.md for detailed instructions"