# E2E Testing with API Backend

This document explains how to run E2E tests with both local storage (Dexie.js) and API backend configurations.

## Overview

The E2E tests can run in two modes:

1. **Local Storage Mode** (default): Uses Dexie.js for local IndexedDB storage
2. **API Backend Mode**: Uses the Express API server with in-memory database

## Setup

First, set up the required environment files:

```bash
# Create .env files from templates
./scripts/setup-e2e-env.sh

# Or manually copy the template files
cp apps/starter-pwa-e2e/.env.local.example apps/starter-pwa-e2e/.env.local
cp apps/starter-pwa-e2e/.env.api.example apps/starter-pwa-e2e/.env.api
```

## Quick Start

### Running with Local Storage (Default)
```bash
# Using short commands
pnpm endweb
pnpm endweblocal

# Using full commands
pnpm e2e:web
pnpm e2e:web:local
```

### Running with API Backend
```bash
# Using short commands
pnpm endwebapi

# Using full commands
pnpm e2e:web:api
```

### Using the Helper Script
```bash
# Local storage mode
./scripts/run-e2e.sh
./scripts/run-e2e.sh --local

# API backend mode
./scripts/run-e2e.sh --api

# Headed mode (visible browser)
./scripts/run-e2e.sh --headed
./scripts/run-e2e.sh --api --headed
```

## Configuration Files

### Environment Files

- `.env.local.example` → `.env.local` - Template for local storage mode
- `.env.api.example` → `.env.api` - Template for API backend mode

**Note**: The actual `.env.local` and `.env.api` files are gitignored for security. Use the setup script or copy from templates.

### Playwright Configuration

The `playwright.config.ts` automatically detects the mode based on environment variables:

- `E2E_USE_API_BACKEND=true` - Enables API backend mode
- `E2E_API_BASE_URL` - API server URL (default: http://localhost:4000)

## How It Works

### Local Storage Mode
- Only starts the PWA server
- Uses Dexie.js for data persistence
- Faster test execution
- No network dependencies

### API Backend Mode
- Starts both API server and PWA server
- API server uses in-memory database
- PWA communicates with API via HTTP
- Tests include network latency and error handling

## Environment Variables

### E2E Test Variables
- `E2E_USE_API_BACKEND` - Enable API backend for tests
- `E2E_API_BASE_URL` - API server URL for tests

### PWA Application Variables
- `VITE_USE_API_BACKEND` - Configure PWA to use API backend
- `VITE_API_BASE_URL` - API server URL for PWA

### API Server Variables (when running in API mode)
- `PORT=4000` - API server port
- `NODE_ENV=development` - Environment mode
- `CORS_ORIGIN=http://localhost:3000` - CORS configuration
- `DB_TYPE=memory` - Use in-memory database
- `DB_ORM=native` - Use native ORM

## Test Improvements

### Enhanced Page Object Model

The page object model has been updated with:

- Increased timeouts for API operations (10s vs 5s)
- Additional wait times for network operations (200ms buffer)
- Better error handling for async operations

### Example Changes

```typescript
// Before
await this.page.waitForFunction(..., { timeout: 5000 });

// After (API-compatible)
await this.page.waitForFunction(..., { timeout: 10000 });
await this.page.waitForTimeout(200); // Buffer for API operations
```

## Troubleshooting

### Browser Installation Issues

If Playwright browsers fail to install:

```bash
# Try alternative installation
./scripts/install-browsers.sh

# Use system Chrome (if available)
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm e2e:web
```

### API Connection Issues

Validate API backend connectivity:

```bash
./scripts/integration-test.sh
```

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 4000 are available
2. **Timing issues**: API mode includes network latency
3. **Environment variables**: Check `.env` files are correctly configured

## Development Workflow

### Testing Both Modes

```bash
# Test local storage mode
pnpm e2e:web:local

# Test API backend mode  
pnpm e2e:web:api

# Compare results to ensure consistency
```

### Debugging

```bash
# Run in headed mode to see browser
pnpm e2e:headed:api

# Use Playwright debug features
npx playwright test --debug
npx playwright show-trace
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm endweb` | Default E2E tests |
| `pnpm endweblocal` | E2E with local storage |
| `pnpm endwebapi` | E2E with API backend |
| `./scripts/run-e2e.sh --help` | Show all options |
| `./scripts/integration-test.sh` | Validate API setup |
| `./scripts/install-browsers.sh` | Install Playwright browsers |