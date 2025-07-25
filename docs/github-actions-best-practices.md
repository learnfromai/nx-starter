# GitHub Actions Best Practices for Nx Monorepos

This guide outlines the best practices implemented in this nx-starter project's CI/CD pipeline and recommendations for maintaining and extending the workflows.

## 🎯 Core Principles

### 1. Efficiency with Nx Affected Commands

**Principle**: Only build and test what has changed to minimize CI time and resource usage.

```yaml
# ✅ Good: Use affected commands
- name: Run affected tests
  run: pnpm nx affected -t test --parallel

# ❌ Avoid: Running all tests unnecessarily
- name: Run all tests
  run: pnpm nx run-many -t test --all
```

**Implementation in our pipelines:**
- CI workflow uses `pnpm run ci:affected`
- Lint checks use `pnpm run lint:affected`
- Build process optimizes with affected projects only

### 2. Parallel Execution

**Principle**: Run independent jobs in parallel to reduce total pipeline time.

```yaml
# ✅ Good: Parallel job execution
jobs:
  test:
    strategy:
      matrix:
        project: [domain-core, application-core, utils-core]
  
  build:
    needs: setup
    runs-on: ubuntu-latest
    # Runs in parallel with test job
```

### 3. Effective Caching

**Principle**: Cache dependencies and build artifacts to speed up subsequent runs.

```yaml
# ✅ Good: Multi-level caching strategy
- name: Setup pnpm cache
  uses: actions/cache@v4
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}

- name: Cache build artifacts
  uses: actions/cache@v4
  with:
    path: |
      dist/
      ~/.cache/nx
    key: ${{ runner.os }}-build-${{ github.sha }}
```

## 🔧 Workflow Organization

### Job Dependencies and Flow

```mermaid
graph TD
    A[Setup] --> B[Code Quality]
    A --> C[Build]
    A --> D[Test]
    B --> E[Security]
    C --> F[E2E Tests]
    D --> F
    E --> G[CI Success]
    F --> G
```

**Benefits:**
- Clear dependency chain
- Fail-fast approach
- Parallel execution where possible
- Resource optimization

### Matrix Strategies

**When to use matrices:**

```yaml
# ✅ Good: Testing across different environments
strategy:
  matrix:
    node-version: ['18.x', '20.x']
    browser: [chromium, firefox, webkit]

# ✅ Good: Testing multiple projects
strategy:
  matrix:
    project: [domain-core, application-core, utils-core]
```

**When to avoid matrices:**
- For jobs that don't benefit from parallel execution
- When resource constraints are a concern
- For deployment jobs (use sequential deployment)

## 🛡️ Security Best Practices

### 1. Minimal Permissions

```yaml
# ✅ Good: Specify minimal required permissions
permissions:
  contents: read
  security-events: write

# ❌ Avoid: Broad permissions
permissions:
  contents: write
  actions: write
  packages: write
```

### 2. Secret Management

```yaml
# ✅ Good: Use secrets for sensitive data
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

# ❌ Avoid: Hardcoded sensitive values
env:
  DATABASE_URL: "postgres://user:password@localhost:5432/db"
```

### 3. Container Security

```yaml
# ✅ Good: Use specific, minimal base images
FROM node:20-alpine AS base

# ✅ Good: Run as non-root user
RUN adduser -S nodejs -u 1001
USER nodejs

# ✅ Good: Multi-stage builds
FROM nginx:alpine AS production
```

## 📊 Performance Optimization

### 1. Resource Management

```yaml
# ✅ Good: Set appropriate timeouts
jobs:
  test:
    timeout-minutes: 30  # Prevent hanging jobs

# ✅ Good: Use Ubuntu latest for better performance
runs-on: ubuntu-latest
```

### 2. Build Optimization

```yaml
# ✅ Good: Use production builds for deployments
- name: Build for production
  run: pnpm run build:prod

# ✅ Good: Optimize Docker builds with cache
- name: Build Docker image
  uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### 3. Conditional Execution

```yaml
# ✅ Good: Skip unnecessary jobs
visual-regression:
  if: github.event_name == 'pull_request'

# ✅ Good: Environment-specific logic
deploy-production:
  if: github.ref == 'refs/heads/main'
```

## 🧪 Testing Strategies

### 1. Test Pyramid Implementation

```yaml
# Unit Tests (Fast, Many)
- name: Run unit tests
  run: pnpm nx affected -t test --parallel

# Integration Tests (Medium speed, Some)
- name: Run integration tests
  run: pnpm nx affected -t integration-test

# E2E Tests (Slow, Few)
- name: Run E2E tests
  run: pnpm nx affected -t e2e
```

### 2. Test Result Management

```yaml
# ✅ Good: Always upload test results
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results-${{ matrix.project }}
    path: |
      coverage/
      test-results/
    retention-days: 30
```

### 3. Flaky Test Handling

```yaml
# ✅ Good: Retry flaky tests
- name: Run E2E tests with retry
  run: pnpm nx e2e starter-pwa-e2e --retry=2
  continue-on-error: false
```

## 🚀 Deployment Best Practices

### 1. Environment Promotion

```yaml
# ✅ Good: Progressive deployment
deploy-staging:
  environment: staging
  if: github.ref == 'refs/heads/develop'

deploy-production:
  environment: production
  needs: [deploy-staging, smoke-tests]
  if: github.ref == 'refs/heads/main'
```

### 2. Health Checks

```yaml
# ✅ Good: Comprehensive health checking
- name: Wait for deployment
  run: |
    for i in {1..30}; do
      if curl -f ${{ vars.API_URL }}/health; then
        echo "Deployment successful"
        exit 0
      fi
      echo "Waiting for deployment... ($i/30)"
      sleep 10
    done
    exit 1
```

### 3. Rollback Strategy

```yaml
# ✅ Good: Automated rollback on failure
- name: Rollback on failure
  if: failure()
  run: |
    kubectl rollout undo deployment/api
    kubectl rollout status deployment/api
```

## 📈 Monitoring and Observability

### 1. Workflow Monitoring

```yaml
# ✅ Good: Create job summaries
- name: Create summary
  run: |
    echo "## Test Results" >> $GITHUB_STEP_SUMMARY
    echo "- Total tests: ${{ steps.test.outputs.total }}" >> $GITHUB_STEP_SUMMARY
    echo "- Passed: ${{ steps.test.outputs.passed }}" >> $GITHUB_STEP_SUMMARY
    echo "- Failed: ${{ steps.test.outputs.failed }}" >> $GITHUB_STEP_SUMMARY
```

### 2. Notification Strategy

```yaml
# ✅ Good: Conditional notifications
- name: Notify on failure
  if: failure() && github.ref == 'refs/heads/main'
  uses: actions/setup-node@v4
  # Send notification to team
```

### 3. Metrics Collection

```yaml
# ✅ Good: Collect pipeline metrics
- name: Report metrics
  run: |
    echo "Pipeline duration: ${{ steps.timer.outputs.duration }}"
    echo "Cache hit rate: ${{ steps.cache.outputs.cache-hit }}"
```

## 🔄 Maintenance Guidelines

### 1. Regular Updates

**Monthly Tasks:**
- Update GitHub Actions versions
- Review and update Node.js versions
- Update security scanning tools
- Review cache strategies

**Example update process:**
```yaml
# Update from
uses: actions/setup-node@v3

# Update to
uses: actions/setup-node@v4
```

### 2. Dependency Management

```yaml
# ✅ Good: Pin major versions, allow minor updates
uses: actions/cache@v4
uses: docker/build-push-action@v5

# ❌ Avoid: Unpinned versions
uses: actions/cache@latest
```

### 3. Documentation

**Keep documentation updated:**
- Workflow purpose and triggers
- Required secrets and variables
- Dependencies between jobs
- Troubleshooting guides

## 🚨 Common Pitfalls and Solutions

### 1. Nx Cache Issues

**Problem**: Nx cache not working in CI
```yaml
# ✅ Solution: Proper cache configuration
env:
  NX_CLOUD_DISTRIBUTED_EXECUTION: false
  NX_REJECT_UNKNOWN_LOCAL_CACHE: 0
```

### 2. pnpm Version Conflicts

**Problem**: Different pnpm versions between local and CI
```yaml
# ✅ Solution: Pin pnpm version
- name: Install pnpm
  uses: pnpm/action-setup@v2
  with:
    version: '>=10.13.1'  # Match package.json engines
```

### 3. Docker Build Context

**Problem**: Docker can't find files
```yaml
# ✅ Solution: Correct build context
- name: Build Docker image
  uses: docker/build-push-action@v5
  with:
    context: .  # Use repository root
    file: ./apps/starter-api/Dockerfile
```

### 4. E2E Test Flakiness

**Problem**: E2E tests fail intermittently
```yaml
# ✅ Solution: Proper waiting and retry logic
- name: Wait for application
  run: |
    timeout 60s bash -c 'until curl -f http://localhost:4200; do sleep 1; done'
  
- name: Run E2E tests
  run: pnpm nx e2e starter-pwa-e2e --retry=2
```

## 📋 Checklist for New Workflows

When creating new workflows, ensure:

- [ ] Proper trigger configuration
- [ ] Minimal required permissions
- [ ] Appropriate caching strategy
- [ ] Error handling and cleanup
- [ ] Artifact upload for debugging
- [ ] Proper job dependencies
- [ ] Timeout configuration
- [ ] Matrix strategies where beneficial
- [ ] Conditional execution logic
- [ ] Documentation and comments

## 🔗 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nx CI/CD Guide](https://nx.dev/ci/intro/ci-with-nx)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Security Hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

This guide serves as a reference for maintaining and extending the CI/CD pipeline while following industry best practices and Nx-specific optimizations.