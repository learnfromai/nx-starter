# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline implementation for the nx-starter project, providing automated build, test, security scanning, and deployment capabilities.

## 🏗️ Pipeline Overview

The CI/CD pipeline consists of multiple workflows that provide comprehensive automation:

### Main Workflows

1. **[Continuous Integration (.github/workflows/ci.yml)](../.github/workflows/ci.yml)**
   - Triggered on push/PR to main/develop branches
   - Runs code quality checks, builds, and tests
   - Uses Nx affected commands for efficiency

2. **[E2E Tests (.github/workflows/e2e-tests.yml)](../.github/workflows/e2e-tests.yml)**
   - Comprehensive end-to-end testing across browsers
   - Mobile and accessibility testing
   - Visual regression testing

3. **[Security (.github/workflows/security.yml)](../.github/workflows/security.yml)**
   - Dependency vulnerability scanning
   - Static code analysis with CodeQL
   - Secret scanning and license compliance

4. **[Performance (.github/workflows/performance.yml)](../.github/workflows/performance.yml)**
   - Bundle size analysis
   - API and frontend performance testing
   - Resource profiling and memory leak detection

5. **[Release (.github/workflows/release.yml)](../.github/workflows/release.yml)**
   - Automated releases on version tags
   - Docker image building and publishing
   - GitHub release creation with changelogs

6. **[Deploy (.github/workflows/deploy.yml)](../.github/workflows/deploy.yml)**
   - Automated deployment to staging/production
   - Health checks and smoke tests
   - Database migrations

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- pnpm 10.13.1 or later
- Docker (for containerized deployments)

### Environment Setup

1. **Local Development**
   ```bash
   # Install dependencies
   pnpm install
   
   # Build libraries
   pnpm run build:libs
   
   # Run tests
   pnpm run test:libs
   
   # Start development servers
   pnpm run dev
   ```

2. **CI/CD Environment Variables**
   Configure these secrets in your GitHub repository:
   
   ```bash
   # Required for Docker image publishing
   GITHUB_TOKEN          # Automatic GitHub token
   
   # Optional: For external deployments
   DEPLOY_KEY            # SSH key for deployment
   DATABASE_URL          # Database connection string
   API_URL               # API endpoint URL
   PWA_URL               # PWA endpoint URL
   ```

## 📋 Pipeline Commands

### Core Commands Used in Pipelines

| Command | Purpose | Used In |
|---------|---------|---------|
| `pnpm run ci:affected` | Run affected builds/tests | CI |
| `pnpm run lint:affected` | Lint affected projects | CI |
| `pnpm run test:affected` | Test affected projects | CI |
| `pnpm run build:prod` | Production builds | Release |
| `pnpm run e2e` | End-to-end tests | E2E |
| `pnpm audit` | Security audit | Security |

### Available Scripts

**Development:**
- `pnpm dev` - Start development servers
- `pnpm build` - Build applications
- `pnpm test` - Run all tests
- `pnpm lint` - Run linting

**Testing:**
- `pnpm test:libs` - Test core libraries
- `pnpm test:api` - Test API application
- `pnpm test:web` - Test PWA application
- `pnpm e2e` - Run E2E tests
- `pnpm test:coverage` - Generate coverage reports

**Quality:**
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code
- `pnpm typecheck` - Type checking

**CI/CD:**
- `pnpm run ci` - Full CI pipeline locally
- `pnpm run ci:affected` - Run only affected projects

## 🔄 Workflow Details

### 1. Continuous Integration (CI)

**Triggers:**
- Push to main/develop branches
- Pull requests to main/develop branches
- Manual workflow dispatch

**Jobs:**
1. **Setup Dependencies** - Cache management and dependency installation
2. **Code Quality** - Linting, type checking, formatting validation
3. **Build** - Build libraries and applications (affected only)
4. **Tests** - Unit and integration tests with coverage
5. **E2E** - End-to-end tests for critical paths
6. **Security** - Basic security scanning
7. **CI Success** - Final status aggregation

**Optimization Features:**
- Nx affected commands to only test/build changed projects
- Parallel job execution
- Dependency and build artifact caching
- Matrix builds for different Node.js versions

### 2. E2E Testing

**Test Types:**
- **API E2E**: REST API endpoint testing with multiple Node.js versions
- **PWA E2E**: Cross-browser testing (Chromium, Firefox, WebKit)
- **Mobile E2E**: Mobile device simulation testing
- **Visual Regression**: UI consistency validation
- **Accessibility**: WCAG compliance testing

**Features:**
- Playwright integration
- Test result artifacts
- Screenshot capture on failures
- Performance metrics collection

### 3. Security Scanning

**Security Checks:**
- **Dependency Scanning**: npm audit and vulnerability detection
- **Static Analysis**: CodeQL security and quality analysis
- **Secret Scanning**: TruffleHog for exposed secrets
- **Docker Security**: Trivy container vulnerability scanning
- **License Compliance**: License compatibility checking

**Scheduled Scans:**
- Daily security scans at 2 AM UTC
- Automatic GitHub security alerts integration

### 4. Performance Monitoring

**Performance Tests:**
- **Bundle Analysis**: JavaScript/CSS size monitoring
- **API Performance**: Load testing with k6
- **Frontend Performance**: Lighthouse CI scoring
- **Resource Profiling**: Memory and CPU usage analysis

**Thresholds:**
- Bundle size limits (500KB JS, 100KB CSS)
- API response time targets (95% < 500ms)
- Lighthouse scores (Performance > 80%, Accessibility > 90%)

### 5. Release Management

**Release Process:**
1. Create version tag (format: `v1.0.0`)
2. Automated validation and building
3. Docker image creation and publishing
4. GitHub release with changelog
5. Artifact publishing

**Docker Images:**
- `ghcr.io/learnfromai/nx-starter-starter-api:latest`
- `ghcr.io/learnfromai/nx-starter-starter-pwa:latest`

### 6. Deployment

**Deployment Environments:**
- **Staging**: Automatic deployment from develop branch
- **Production**: Manual or release-triggered deployment

**Deployment Steps:**
1. Environment validation
2. Application deployment (API + PWA)
3. Health checks
4. Smoke tests
5. Database migrations (production only)
6. Notification and reporting

## 🏗️ Architecture Integration

### Clean Architecture Compliance

The CI/CD pipeline respects the clean architecture principles:

- **Domain Core**: Independent testing with no external dependencies
- **Application Core**: Use case and service testing with mocked dependencies
- **Infrastructure**: Integration testing with real external services
- **Applications**: End-to-end testing of complete user workflows

### Nx Monorepo Optimization

- **Affected Commands**: Only build/test changed projects
- **Dependency Graph**: Respect project dependencies for build order
- **Parallel Execution**: Run independent projects simultaneously
- **Caching**: Cache build artifacts and test results

## 🔧 Customization

### Adding New Projects

When adding new Nx projects, the pipeline automatically detects them if they follow conventions:

1. Add project to workspace
2. Ensure proper `project.json` configuration
3. Tests are automatically included in CI runs
4. Add specific E2E tests if needed

### Environment-Specific Configuration

Create environment-specific configurations:

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://api.yourdomain.com',
  // ... other config
};
```

### Custom Deployment Targets

Modify the deployment workflow for your infrastructure:

```yaml
# .github/workflows/deploy.yml
- name: Deploy to Kubernetes
  run: |
    kubectl apply -f k8s/
    kubectl set image deployment/api api=${{ env.IMAGE_NAME }}:${{ env.VERSION }}
```

## 📊 Monitoring and Reporting

### Artifacts and Reports

All workflows generate artifacts for debugging and analysis:

- **Test Results**: JUnit XML and HTML reports
- **Coverage Reports**: Code coverage analysis
- **Security Reports**: Vulnerability and compliance reports
- **Performance Reports**: Lighthouse and load test results
- **Build Artifacts**: Application bundles and Docker images

### GitHub Integration

- **Status Checks**: Required status checks for PR merging
- **Security Alerts**: Automated vulnerability notifications
- **Deployment Status**: Environment deployment tracking
- **Performance Budgets**: Automated performance regression detection

## 🛠️ Troubleshooting

### Common Issues

1. **pnpm Version Mismatch**
   ```bash
   # Ensure correct pnpm version in workflows
   version: '>=10.13.1'
   ```

2. **Cache Issues**
   ```bash
   # Clear Nx cache
   pnpm nx reset
   ```

3. **Docker Build Failures**
   ```bash
   # Check Dockerfile paths and build context
   docker build -f apps/starter-api/Dockerfile .
   ```

4. **E2E Test Failures**
   ```bash
   # Run E2E tests locally with debug mode
   pnpm nx e2e starter-pwa-e2e --headed
   ```

### Debug Commands

```bash
# Local CI simulation
pnpm run ci

# Test specific project
pnpm nx test starter-api --watch

# Build with verbose output
pnpm nx build starter-api --verbose

# Check affected projects
pnpm nx show projects --affected
```

## 📚 Best Practices

### Code Quality
- All code must pass linting and type checking
- Minimum test coverage requirements
- Proper error handling and logging
- Security-first development practices

### Performance
- Bundle size monitoring and limits
- Performance budget enforcement
- Regular performance testing
- Resource usage optimization

### Security
- Regular dependency updates
- Secret scanning and management
- Container security best practices
- Access control and permissions

### Deployment
- Blue-green deployment strategies
- Automated rollback capabilities
- Health checks and monitoring
- Database migration safety

## 🔗 Related Documentation

- [Nx Documentation](https://nx.dev)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Clean Architecture Principles](../docs/architecture.md)

---

**Last Updated:** December 2024  
**Version:** 1.0.0