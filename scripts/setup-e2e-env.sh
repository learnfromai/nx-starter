#!/bin/bash

# E2E Environment Setup Script
# This script sets up the required .env files for E2E testing

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔧 Setting up E2E test environment files...${NC}"

E2E_DIR="apps/starter-pwa-e2e"

# Create .env.local if it doesn't exist
if [ ! -f "$E2E_DIR/.env.local" ]; then
  echo -e "${YELLOW}📝 Creating .env.local from template...${NC}"
  cp "$E2E_DIR/.env.local.example" "$E2E_DIR/.env.local"
else
  echo -e "${YELLOW}✅ .env.local already exists${NC}"
fi

# Create .env.api if it doesn't exist
if [ ! -f "$E2E_DIR/.env.api" ]; then
  echo -e "${YELLOW}📝 Creating .env.api from template...${NC}"
  cp "$E2E_DIR/.env.api.example" "$E2E_DIR/.env.api"
else
  echo -e "${YELLOW}✅ .env.api already exists${NC}"
fi

echo -e "${GREEN}🎉 E2E environment setup complete!${NC}"
echo ""
echo -e "${YELLOW}You can now run:${NC}"
echo "  pnpm endweblocal   - E2E tests with local storage"
echo "  pnpm endwebapi     - E2E tests with API backend"
echo "  ./scripts/run-e2e.sh --help - See all options"