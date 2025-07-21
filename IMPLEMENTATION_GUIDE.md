# Quick Start Implementation Guide

## Phase 1: High-Impact Tools (Immediate Implementation)

### 1. Enhanced Import Management

```bash
pnpm add -D eslint-plugin-import eslint-plugin-unused-imports eslint-plugin-simple-import-sort eslint-import-resolver-typescript
```

#### ESLint Configuration Update (eslint.config.mjs)

```javascript
import nx from '@nx/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Nx module boundaries
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: ['type:domain', 'type:util'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:application',
                'type:util',
              ],
            },
          ],
        },
      ],
      
      // Import management
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
      'import/no-unused-modules': 'warn',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.base.json',
        },
      },
    },
  },
];
```

#### Benefits:
- Automatic import sorting and cleanup
- Detection of circular dependencies
- Removal of unused imports
- Better import organization

### 2. Security Scanning

```bash
pnpm add -D audit-ci eslint-plugin-security
```

#### Audit CI Configuration (.auditci.json)

```json
{
  "moderate": true,
  "high": true,
  "critical": true,
  "allowlist": [],
  "report-type": "full",
  "output-format": "text",
  "pass-enoaudit": true
}
```

#### ESLint Security Plugin (add to eslint.config.mjs)

```javascript
import security from 'eslint-plugin-security';

// Add to plugins and rules
{
  plugins: {
    security,
  },
  rules: {
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
  }
}
```

#### Package.json Scripts Update

```json
{
  "scripts": {
    "security:audit": "audit-ci --config .auditci.json",
    "security:fix": "pnpm audit --fix",
    "lint:security": "eslint --ext .ts,.tsx --no-eslintrc --config eslint.security.config.mjs ."
  }
}
```

### 3. Bundle Analysis

```bash
pnpm add -D webpack-bundle-analyzer vite-bundle-analyzer
```

#### Webpack Bundle Analyzer Setup

Create `scripts/analyze-bundle.js`:

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { execSync } = require('child_process');

// Build with analyzer
process.env.ANALYZE = 'true';
execSync('pnpm build', { stdio: 'inherit' });
```

#### Vite Bundle Analyzer (for PWA)

Update `apps/starter-pwa/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig({
  plugins: [
    react(),
    process.env.ANALYZE && analyzer({
      analyzerMode: 'server',
      analyzerPort: 8888,
      openAnalyzer: true,
    })
  ].filter(Boolean),
  // ... rest of config
});
```

#### Package.json Scripts

```json
{
  "scripts": {
    "analyze:api": "ANALYZE=true pnpm build:api",
    "analyze:web": "ANALYZE=true pnpm build:web",
    "analyze:all": "pnpm analyze:api && pnpm analyze:web"
  }
}
```

### 4. Spell Checking

```bash
pnpm add -D cspell
```

#### CSpell Configuration (cspell.config.yaml)

```yaml
version: "0.2"
language: "en"
words:
  - tsyringe
  - typeorm
  - zustand
  - pnpm
  - eslint
  - vite
  - tailwindcss
  - lucide
  - radix
ignorePaths:
  - node_modules
  - dist
  - coverage
  - "**/*.log"
  - pnpm-lock.yaml
files:
  - "**/*.{ts,tsx,js,jsx,md,json}"
  - "!node_modules/**"
  - "!dist/**"
  - "!coverage/**"
overrides:
  - filename: "**/*.{ts,tsx,js,jsx}"
    words:
      - readonly
      - typeof
      - keyof
      - const
      - enum
```

#### Package.json Scripts

```json
{
  "scripts": {
    "spell:check": "cspell \"**/*.{ts,tsx,md,json}\"",
    "spell:check:files": "cspell",
    "spell:add-word": "echo"
  }
}
```

## Phase 2: Performance & Quality Tools

### 1. Lighthouse CI

```bash
pnpm add -D @lhci/cli lighthouse
```

#### Lighthouse CI Configuration (lighthouserc.js)

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start:web',
      url: ['http://localhost:4200'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### 2. Duplicate Code Detection

```bash
pnpm add -D jscpd
```

#### JSCPD Configuration (.jscpd.json)

```json
{
  "threshold": 5,
  "reporters": ["html", "console"],
  "ignore": ["**/node_modules/**", "**/dist/**", "**/*.spec.ts", "**/*.test.ts"],
  "minLines": 5,
  "minTokens": 50,
  "output": "./reports/jscpd"
}
```

### 3. Dead Code Detection

```bash
pnpm add -D knip
```

#### Knip Configuration (knip.config.ts)

```typescript
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'apps/*/src/main.ts',
    'libs/*/src/index.ts',
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/e2e/**/*.ts',
  ],
  project: [
    'apps/**/*.ts',
    'apps/**/*.tsx',
    'libs/**/*.ts',
    'libs/**/*.tsx',
  ],
  ignore: [
    'dist/**',
    'coverage/**',
    'node_modules/**',
    '**/*.d.ts',
  ],
  ignoreDependencies: [
    '@nx/workspace', // Used by Nx but might not be directly imported
  ],
  includeEntryExports: true,
};

export default config;
```

## Updated Package.json Scripts

```json
{
  "scripts": {
    // Enhanced development
    "dev:clean": "rimraf dist tmp && pnpm dev",
    "dev:debug": "NODE_ENV=development DEBUG=* pnpm dev",
    
    // Security
    "security:audit": "audit-ci --config .auditci.json",
    "security:fix": "pnpm audit --fix",
    "security:check": "pnpm security:audit && pnpm lint:security",
    
    // Performance & Analysis
    "analyze:bundle": "pnpm analyze:all",
    "analyze:api": "ANALYZE=true pnpm build:api",
    "analyze:web": "ANALYZE=true pnpm build:web",
    "perf:lighthouse": "lhci autorun",
    "perf:lighthouse:ci": "lhci autorun --collect.numberOfRuns=1",
    
    // Code Quality
    "quality:check": "pnpm lint && pnpm typecheck && pnpm spell:check && pnpm check:duplicates && pnpm check:unused",
    "quality:fix": "pnpm lint:fix && pnpm format",
    "check:duplicates": "jscpd --config .jscpd.json",
    "check:unused": "knip",
    "spell:check": "cspell \"**/*.{ts,tsx,md,json}\"",
    
    // Enhanced CI
    "ci:full": "pnpm quality:check && pnpm test && pnpm security:check && pnpm build && pnpm perf:lighthouse:ci",
    "ci:quality": "pnpm quality:check && pnpm security:audit",
    
    // Maintenance
    "deps:check": "pnpm outdated",
    "deps:update": "pnpm update --latest",
    "clean:all": "rimraf dist tmp node_modules coverage .nx && pnpm install"
  }
}
```

## CI/CD Integration

### GitHub Actions Example (.github/workflows/ci.yml enhancement)

```yaml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Quality checks
        run: pnpm ci:quality
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Performance audit
        run: pnpm perf:lighthouse:ci
        continue-on-error: true
```

## VSCode Workspace Settings

`.vscode/settings.json`:

```json
{
  "eslint.experimental.useFlatConfig": true,
  "eslint.workingDirectories": ["apps/*", "libs/*"],
  "cSpell.words": ["tsyringe", "typeorm", "zustand", "pnpm"],
  "typescript.preferences.organizeImports": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  }
}
```

## Expected Benefits After Phase 1

1. **Code Quality**: 40% reduction in import-related issues
2. **Security**: Automated vulnerability detection in CI
3. **Performance**: Bundle size visibility and optimization opportunities
4. **Developer Experience**: Cleaner code organization and fewer typos
5. **Maintenance**: Easier dependency management and issue detection

## Next Steps

1. Implement Phase 1 tools (1-2 days)
2. Run quality checks and fix any issues found
3. Integrate into CI/CD pipeline
4. Monitor impact for 1 week
5. Plan Phase 2 implementation based on results