#!/bin/bash

# =============================================================================
# Railway Deployment Validation Script
# =============================================================================
# This script validates that the project is ready for Railway deployment
# Run from the project root directory

set -e

echo "🔍 Validating Railway deployment setup..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

WARNINGS=0
ERRORS=0

# Function to print status
print_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ((WARNINGS++))
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ((ERRORS++))
            ;;
        "INFO")
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "apps/api" ] || [ ! -d "apps/web" ]; then
    print_status "ERROR" "Please run this script from the project root directory"
    exit 1
fi

print_status "OK" "Running from project root directory"

# Check for required files
echo ""
echo "📁 Checking Railway configuration files..."

if [ -f "apps/api/railway.json" ]; then
    print_status "OK" "API Railway configuration found"
else
    print_status "ERROR" "apps/api/railway.json not found"
fi

if [ -f "apps/web/railway.json" ]; then
    print_status "OK" "Web Railway configuration found"
else
    print_status "ERROR" "apps/web/railway.json not found"
fi

if [ -f "apps/api/.env.railway" ]; then
    print_status "OK" "API environment template found"
else
    print_status "ERROR" "apps/api/.env.railway not found"
fi

if [ -f "apps/web/.env.railway" ]; then
    print_status "OK" "Web environment template found"
else
    print_status "ERROR" "apps/web/.env.railway not found"
fi

if [ -f ".github/workflows/deploy-railway.yml" ]; then
    print_status "OK" "Railway GitHub Actions workflow found"
else
    print_status "WARN" "Railway GitHub Actions workflow not found"
fi

if [ -f "docs/RAILWAY_DEPLOYMENT.md" ]; then
    print_status "OK" "Railway deployment documentation found"
else
    print_status "ERROR" "docs/RAILWAY_DEPLOYMENT.md not found"
fi

# Check deployment scripts
echo ""
echo "🔧 Checking deployment scripts..."

if [ -f "scripts/deploy-api-railway.sh" ] && [ -x "scripts/deploy-api-railway.sh" ]; then
    print_status "OK" "API deployment script found and executable"
else
    print_status "ERROR" "scripts/deploy-api-railway.sh not found or not executable"
fi

if [ -f "scripts/deploy-web-railway.sh" ] && [ -x "scripts/deploy-web-railway.sh" ]; then
    print_status "OK" "Web deployment script found and executable"
else
    print_status "ERROR" "scripts/deploy-web-railway.sh not found or not executable"
fi

# Check package.json scripts
echo ""
echo "📦 Checking package.json scripts..."

if grep -q '"deploy:railway:api"' package.json; then
    print_status "OK" "deploy:railway:api script found in package.json"
else
    print_status "ERROR" "deploy:railway:api script not found in package.json"
fi

if grep -q '"deploy:railway:web"' package.json; then
    print_status "OK" "deploy:railway:web script found in package.json"
else
    print_status "ERROR" "deploy:railway:web script not found in package.json"
fi

if grep -q '"deploy:railway:all"' package.json; then
    print_status "OK" "deploy:railway:all script found in package.json"
else
    print_status "ERROR" "deploy:railway:all script not found in package.json"
fi

# Test builds
echo ""
echo "🔨 Testing builds..."

print_status "INFO" "Testing API build..."
if pnpm run build:api > /dev/null 2>&1; then
    if [ -f "dist/apps/api/main.js" ] && [ -f "dist/apps/api/package.json" ]; then
        print_status "OK" "API builds successfully"
    else
        print_status "ERROR" "API build missing required files"
    fi
else
    print_status "ERROR" "API build failed"
fi

print_status "INFO" "Testing web build..."
if pnpm run build:web > /dev/null 2>&1; then
    if [ -f "dist/apps/web/index.html" ] && [ -d "dist/apps/web/assets" ]; then
        print_status "OK" "Web builds successfully"
    else
        print_status "ERROR" "Web build missing required files"
    fi
else
    print_status "ERROR" "Web build failed"
fi

# Check Railway.json configurations
echo ""
echo "⚙️  Validating Railway configurations..."

if [ -f "apps/api/railway.json" ]; then
    if jq empty apps/api/railway.json 2>/dev/null; then
        print_status "OK" "API railway.json is valid JSON"
        
        # Check for required fields
        if jq -e '.build.buildCommand' apps/api/railway.json > /dev/null; then
            print_status "OK" "API railway.json has build command"
        else
            print_status "WARN" "API railway.json missing build command"
        fi
        
        if jq -e '.deploy.startCommand' apps/api/railway.json > /dev/null; then
            print_status "OK" "API railway.json has start command"
        else
            print_status "WARN" "API railway.json missing start command"
        fi
    else
        print_status "ERROR" "API railway.json is invalid JSON"
    fi
fi

if [ -f "apps/web/railway.json" ]; then
    if jq empty apps/web/railway.json 2>/dev/null; then
        print_status "OK" "Web railway.json is valid JSON"
        
        # Check for required fields
        if jq -e '.build.buildCommand' apps/web/railway.json > /dev/null; then
            print_status "OK" "Web railway.json has build command"
        else
            print_status "WARN" "Web railway.json missing build command"
        fi
        
        if jq -e '.deploy.staticPublishPath' apps/web/railway.json > /dev/null; then
            print_status "OK" "Web railway.json has static publish path"
        else
            print_status "WARN" "Web railway.json missing static publish path"
        fi
    else
        print_status "ERROR" "Web railway.json is invalid JSON"
    fi
fi

# Summary
echo ""
echo "📊 Validation Summary"
echo "===================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_status "OK" "All validations passed! Ready for Railway deployment."
    echo ""
    echo "🚀 Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Follow the Railway deployment guide: docs/RAILWAY_DEPLOYMENT.md"
    echo "3. Test locally with: pnpm run deploy:railway:all"
elif [ $ERRORS -eq 0 ]; then
    print_status "WARN" "Validation completed with $WARNINGS warning(s). Deployment should work but review warnings."
    echo ""
    echo "🚀 You can proceed with deployment, but consider addressing the warnings."
else
    print_status "ERROR" "Validation failed with $ERRORS error(s) and $WARNINGS warning(s)."
    echo ""
    echo "❌ Please fix the errors before deploying to Railway."
    exit 1
fi