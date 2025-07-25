#!/bin/bash

# Integration Test Script
# This script validates the API/PWA integration without running full E2E tests

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🧪 Running Integration Tests${NC}"

# Start API server in background
echo -e "${YELLOW}🚀 Starting API server...${NC}"
PORT=4000 NODE_ENV=development CORS_ORIGIN=http://localhost:3000 DB_TYPE=memory DB_ORM=native pnpm start:api &
API_PID=$!

# Wait for API server to start
echo -e "${YELLOW}⏳ Waiting for API server to start...${NC}"
sleep 5

# Wait with retries
for i in {1..12}; do
  if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API server is ready after ${i}0 seconds${NC}"
    break
  fi
  if [ $i -eq 12 ]; then
    echo -e "${RED}❌ API server failed to start within 2 minutes${NC}"
    kill $API_PID 2>/dev/null || true
    exit 1
  fi
  echo -e "${YELLOW}⏳ Still waiting... (attempt $i/12)${NC}"
  sleep 10
done

# Test API todos endpoint
echo -e "${YELLOW}🔍 Testing API todos endpoint...${NC}"
if curl -f -X GET http://localhost:4000/api/todos > /dev/null 2>&1; then
  echo -e "${GREEN}✅ API todos endpoint is working${NC}"
else
  echo -e "${RED}❌ API todos endpoint is not working${NC}"
  kill $API_PID 2>/dev/null || true
  exit 1
fi

# Test creating a todo
echo -e "${YELLOW}🔍 Testing todo creation...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:4000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Integration Test Todo","priority":"medium"}')

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Todo creation is working${NC}"
  TODO_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo -e "${YELLOW}📝 Created todo with ID: $TODO_ID${NC}"
else
  echo -e "${RED}❌ Todo creation failed${NC}"
  echo "Response: $RESPONSE"
  kill $API_PID 2>/dev/null || true
  exit 1
fi

# Test retrieving todos
echo -e "${YELLOW}🔍 Testing todo retrieval...${NC}"
TODOS_RESPONSE=$(curl -s http://localhost:4000/api/todos)
if echo "$TODOS_RESPONSE" | grep -q "Integration Test Todo"; then
  echo -e "${GREEN}✅ Todo retrieval is working${NC}"
else
  echo -e "${RED}❌ Todo retrieval failed${NC}"
  echo "Response: $TODOS_RESPONSE"
  kill $API_PID 2>/dev/null || true
  exit 1
fi

# Clean up
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
kill $API_PID 2>/dev/null || true
wait $API_PID 2>/dev/null || true

echo -e "${GREEN}🎉 All integration tests passed!${NC}"
echo -e "${YELLOW}💡 The API backend is working correctly for E2E tests${NC}"