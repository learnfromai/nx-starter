#!/bin/bash

# E2E Test Runner Script
# This script helps run E2E tests with different configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
MODE="local"
HEADED=""
HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --api)
      MODE="api"
      shift
      ;;
    --local)
      MODE="local"
      shift
      ;;
    --headed)
      HEADED="--headed"
      shift
      ;;
    --help|-h)
      HELP=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

if [ "$HELP" = true ]; then
  echo "E2E Test Runner"
  echo ""
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --api     Run tests with API backend (starts both API and PWA servers)"
  echo "  --local   Run tests with local storage (Dexie.js) - default"
  echo "  --headed  Run tests in headed mode (visible browser)"
  echo "  --help    Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                # Run with local storage"
  echo "  $0 --api          # Run with API backend"
  echo "  $0 --api --headed # Run with API backend in headed mode"
  exit 0
fi

echo -e "${GREEN}🚀 Running E2E Tests${NC}"
echo -e "${YELLOW}Mode: $MODE${NC}"
if [ -n "$HEADED" ]; then
  echo -e "${YELLOW}Browser: Headed (visible)${NC}"
else
  echo -e "${YELLOW}Browser: Headless${NC}"
fi
echo ""

# Check if playwright browsers are installed
echo -e "${YELLOW}📦 Checking Playwright installation...${NC}"
if ! npx playwright --version > /dev/null 2>&1; then
  echo -e "${RED}❌ Playwright not found. Please install dependencies first.${NC}"
  exit 1
fi

# Try to install browsers if not available
if ! npx playwright list --json 2>/dev/null | grep -q '"name": "chromium"'; then
  echo -e "${YELLOW}🔽 Installing Playwright browsers...${NC}"
  if ! npx playwright install chromium; then
    echo -e "${RED}❌ Failed to install Playwright browsers.${NC}"
    echo -e "${YELLOW}💡 You can try using system Chrome by setting PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1${NC}"
    echo -e "${YELLOW}   and ensure Chrome is installed on your system.${NC}"
    exit 1
  fi
fi

# Run tests based on mode
if [ "$MODE" = "api" ]; then
  echo -e "${GREEN}🔧 Running E2E tests with API backend...${NC}"
  if [ -n "$HEADED" ]; then
    pnpm e2e:headed:api
  else
    pnpm e2e:web:api
  fi
else
  echo -e "${GREEN}🔧 Running E2E tests with local storage...${NC}"
  if [ -n "$HEADED" ]; then
    pnpm e2e:headed:local
  else
    pnpm e2e:web:local
  fi
fi

echo -e "${GREEN}✅ Tests completed!${NC}"