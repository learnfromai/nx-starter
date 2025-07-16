# Phase 5 - App Structure Setup: Independent Migration Plan

## Overview

Phase 5 focuses on generating empty Nx applications (frontend and backend) and configuring their build/serve targets. This phase is **completely independent** from Phase 4 (Application Layer Migration) and can be executed simultaneously by another agent.

## Independence Analysis

### ✅ Why Phase 5 is Independent from Phase 4

1. **No Shared Files**: Phase 5 creates new application scaffolding, Phase 4 migrates shared library code
2. **Different Target Directories**: 
   - Phase 4: Works in `libs/shared-application/`
   - Phase 5: Works in `apps/frontend/` and `apps/backend/`
3. **No Dependencies**: Phase 5 only depends on Phase 1-2 (workspace setup and shared libraries structure)
4. **Parallel Execution Safe**: Both phases modify completely different parts of the codebase

### ✅ Can Run Simultaneously: YES

Another agent can safely execute Phase 5 while Phase 4 is running because:
- Different file targets (no conflicts)
- No shared state or dependencies
- Independent build verification
- Separate test scopes

---

## Phase 5 Components

### **Step 1: Generate Empty Applications**
**Estimated Files**: 25-35 files  
**Goal**: Create scaffolded frontend and backend apps with proper Nx structure

### **Step 2: Configure Build and Serve Targets**  
**Estimated Files**: 8-12 configuration files  
**Goal**: Set up development and production build configurations

---

## Step 1: Generate Empty Applications

### 1.1 Generate React Frontend Application

**Command**:
```bash
cd nx-starter
nx g @nx/react:app frontend --bundler=vite --unitTestRunner=vitest --e2eTestRunner=playwright --routing=true --style=css
```

**Directory Structure to Create**:
```
apps/frontend/
├── project.json                    # Nx project configuration
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # App-specific TypeScript config
├── tsconfig.app.json              # App compilation config
├── tsconfig.spec.json             # Test compilation config
├── index.html                     # Entry HTML
├── src/
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Root component
│   ├── App.module.css             # Root styles
│   ├── presentation/              # UI layer (Clean Architecture)
│   │   ├── components/
│   │   │   ├── common/            # Shared UI components
│   │   │   └── ui/                # Base UI components
│   │   ├── features/
│   │   │   └── todo/              # Feature-specific components
│   │   │       ├── components/
│   │   │       ├── pages/
│   │   │       └── view-models/
│   │   └── layout/                # Layout components
│   ├── infrastructure/            # Infrastructure layer
│   │   ├── api/                   # HTTP clients
│   │   ├── persistence/           # Local storage, IndexedDB
│   │   ├── state/                 # Zustand stores
│   │   └── di/                    # Dependency injection container
│   └── assets/                    # Static assets
├── public/                        # Public assets
└── eslint.config.js               # App-specific ESLint config
```

**Tasks**:
- [ ] Generate React app with Nx generator
- [ ] Create Clean Architecture directory structure
- [ ] Set up basic component scaffolding
- [ ] Configure TypeScript paths for app
- [ ] Set up placeholder components

### 1.2 Generate Express Backend Application  

**Command**:
```bash
nx g @nx/express:app backend --unitTestRunner=vitest --js=false
```

**Directory Structure to Create**:
```
apps/backend/
├── project.json                   # Nx project configuration
├── tsconfig.json                  # App-specific TypeScript config
├── tsconfig.app.json             # App compilation config
├── tsconfig.spec.json            # Test compilation config
├── src/
│   ├── main.ts                    # Express entry point
│   ├── app/                       # App configuration
│   │   ├── app.ts                 # Express app setup
│   │   └── config.ts              # Configuration
│   ├── presentation/              # Presentation layer (Clean Architecture)
│   │   ├── controllers/           # Express controllers
│   │   ├── routes/                # Route definitions
│   │   ├── middleware/            # Express middleware
│   │   └── dto/                   # API-specific DTOs
│   ├── infrastructure/            # Infrastructure layer
│   │   ├── persistence/           # Database repositories
│   │   │   ├── typeorm/
│   │   │   ├── sequelize/
│   │   │   ├── mongoose/
│   │   │   └── prisma/
│   │   ├── external-services/     # Third-party integrations
│   │   └── di/                    # Dependency injection container
│   └── shared/                    # Backend-specific utilities
│       └── middleware/
├── prisma/                        # Database schema (placeholder)
└── tests/                         # Integration tests
    └── app.integration.spec.ts
```

**Tasks**:
- [ ] Generate Express app with Nx generator
- [ ] Create Clean Architecture directory structure
- [ ] Set up basic controller/route scaffolding
- [ ] Configure TypeScript paths for app
- [ ] Set up placeholder controllers and middleware

### 1.3 Configure App Dependencies

**Frontend project.json dependencies**:
```json
{
  "name": "frontend",
  "implicitDependencies": ["shared-domain", "shared-application", "shared-utils"],
  "tags": ["type:app", "scope:frontend"]
}
```

**Backend project.json dependencies**:
```json
{
  "name": "backend", 
  "implicitDependencies": ["shared-domain", "shared-application", "shared-utils"],
  "tags": ["type:app", "scope:backend"]
}
```

**Verification**: 
- [ ] `nx build frontend` succeeds
- [ ] `nx build backend` succeeds  
- [ ] Both apps generate without errors

---

## Step 2: Configure Build and Serve Targets

### 2.1 Configure Frontend Build Targets

**Update `apps/frontend/project.json`**:
```json
{
  "name": "frontend",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/frontend/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/frontend"
      },
      "configurations": {
        "development": {
          "mode": "development"
        },
        "production": {
          "mode": "production"
        }
      }
    },
    "serve": {
      "executor": "@nx/vite:dev-server",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "frontend:build"
      },
      "configurations": {
        "development": {
          "buildTarget": "frontend:build:development",
          "hmr": true
        },
        "production": {
          "buildTarget": "frontend:build:production",
          "hmr": false
        }
      }
    },
    "test": {
      "executor": "@nx/vite:test",
      "outputs": ["{options.reportsDirectory}"],
      "options": {
        "passWithNoTests": true,
        "reportsDirectory": "../../coverage/apps/frontend"
      }
    }
  },
  "tags": ["type:app", "scope:frontend"],
  "implicitDependencies": ["shared-domain", "shared-application", "shared-utils"]
}
```

**Update `apps/frontend/vite.config.ts`**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  
  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  // Nx-specific build configuration
  build: {
    outDir: '../../dist/apps/frontend',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/frontend',
      provider: 'v8',
    },
  },
});
```

### 2.2 Configure Backend Build Targets

**Update `apps/backend/project.json`**:
```json
{
  "name": "backend",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/backend/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "options": {
        "target": "node",
        "compiler": "tsc",
        "outputPath": "dist/apps/backend",
        "main": "apps/backend/src/main.ts",
        "tsConfig": "apps/backend/tsconfig.app.json",
        "assets": ["apps/backend/src/assets"],
        "generatePackageJson": true
      },
      "configurations": {
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "inspect": false
        },
        "production": {
          "optimization": true,
          "extractLicenses": true,
          "inspect": false,
          "fileReplacements": [
            {
              "replace": "apps/backend/src/environments/environment.ts",
              "with": "apps/backend/src/environments/environment.prod.ts"
            }
          ]
        }
      }
    },
    "serve": {
      "executor": "@nx/js:node",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "backend:build"
      },
      "configurations": {
        "development": {
          "buildTarget": "backend:build:development"
        },
        "production": {
          "buildTarget": "backend:build:production"
        }
      }
    },
    "test": {
      "executor": "@nx/vite:test",
      "outputs": ["{options.reportsDirectory}"],
      "options": {
        "passWithNoTests": true,
        "reportsDirectory": "../../coverage/apps/backend"
      }
    }
  },
  "tags": ["type:app", "scope:backend"],
  "implicitDependencies": ["shared-domain", "shared-application", "shared-utils"]
}
```

### 2.3 Set Up Environment Configuration

**Create `apps/backend/src/environments/environment.ts`**:
```typescript
export const environment = {
  production: false,
  port: process.env.PORT || 3000,
  apiPrefix: '/api',
};
```

**Create `apps/backend/src/environments/environment.prod.ts`**:
```typescript
export const environment = {
  production: true,
  port: process.env.PORT || 3000,
  apiPrefix: '/api',
};
```

### 2.4 Configure Development Servers

**Update root `package.json` scripts**:
```json
{
  "scripts": {
    "dev": "concurrently \"nx serve frontend\" \"nx serve backend\"",
    "dev:frontend": "nx serve frontend",
    "dev:backend": "nx serve backend",
    "build": "nx run-many --target=build --all",
    "test": "nx run-many --target=test --all"
  }
}
```

**Install concurrently for parallel dev servers**:
```bash
cd nx-starter
npm install --save-dev concurrently
```

---

## Key Migration Challenges

### 1. **Path Alias Configuration**
- Ensure `tsconfig.base.json` includes path mappings for shared libraries
- Configure Vite and Webpack to resolve shared library imports
- Set up proper module resolution

### 2. **Build Target Dependencies**  
- Configure implicit dependencies on shared libraries
- Ensure shared libraries build before applications
- Set up proper build order

### 3. **Development Workflow**
- Configure hot reloading for both frontend and backend
- Set up concurrent development servers
- Ensure proper port configuration

### 4. **Environment Configuration**
- Set up development vs production configurations
- Configure environment-specific settings
- Set up proper asset handling

---

## Verification Commands

### Build Verification
```bash
# Build shared libraries first
nx build shared-domain
nx build shared-application  
nx build shared-utils

# Build applications
nx build frontend
nx build backend
```

### Serve Verification
```bash
# Test individual dev servers
nx serve frontend  # Should start on port 4200
nx serve backend   # Should start on port 3000

# Test concurrent dev servers
npm run dev        # Should start both simultaneously
```

### Test Verification
```bash
# Run individual tests
nx test frontend
nx test backend

# Run all tests
nx run-many --target=test --all
```

### Dependency Graph Verification
```bash
# Check dependency relationships
nx graph

# Should show:
# frontend -> shared-application -> shared-domain
# frontend -> shared-utils
# backend -> shared-application -> shared-domain  
# backend -> shared-utils
```

---

## Expected Benefits

### 1. **Application Foundation**
- Empty but properly configured React and Express apps
- Clean Architecture directory structure ready for migration
- Proper build and development workflows

### 2. **Development Workflow**  
- Concurrent frontend/backend development
- Hot reloading for both applications
- Unified build and test commands

### 3. **Scalable Architecture**
- Applications properly depend on shared libraries
- Build order correctly configured
- Ready for actual code migration in subsequent phases

### 4. **Template Ready**
- Generic configuration suitable for any project
- Reusable Nx app structure
- No hardcoded project-specific names

---

## Success Criteria

- [ ] **Frontend app generates successfully**: `nx g @nx/react:app frontend`
- [ ] **Backend app generates successfully**: `nx g @nx/express:app backend`  
- [ ] **Both apps build without errors**: `nx build frontend && nx build backend`
- [ ] **Development servers start**: `nx serve frontend` and `nx serve backend`
- [ ] **Concurrent development works**: `npm run dev`
- [ ] **Dependency graph is correct**: `nx graph` shows proper relationships
- [ ] **Tests run successfully**: `nx test frontend && nx test backend`
- [ ] **Clean Architecture structure created**: Proper directory organization
- [ ] **Path aliases configured**: Shared library imports resolve correctly

---

## Parallel Execution Safety

### ✅ **Safe to Run with Phase 4** because:

1. **No File Conflicts**: Phase 4 works in `libs/`, Phase 5 works in `apps/`
2. **No Shared Dependencies**: Different build targets and verification commands  
3. **Independent Verification**: Separate test and build scopes
4. **Different Git Changes**: No overlapping file modifications
5. **Isolated Scope**: Each phase has completely separate responsibilities

### **Coordination Points**:
- Both phases depend on Phase 1-2 completion (workspace setup)
- Both phases can be verified independently
- Results can be merged safely after both complete

This phase creates the foundation for the actual application code migration in Phases 6-7, while Phase 4 creates the shared application layer that these apps will eventually consume.
