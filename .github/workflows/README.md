# GitHub Actions Workflows

This directory contains the comprehensive CI/CD pipeline for the nx-starter project. Each workflow is designed to handle specific aspects of the development lifecycle while following best practices for Nx monorepos.

## 🔄 Workflow Overview

| Workflow | Purpose | Triggers | Duration |
|----------|---------|----------|----------|
| [**ci.yml**](ci.yml) | Main CI pipeline | Push/PR to main/develop | ~15-20 min |
| [**e2e-tests.yml**](e2e-tests.yml) | End-to-end testing | Push/PR + Nightly | ~30-45 min |
| [**security.yml**](security.yml) | Security scanning | Push/PR + Daily | ~10-15 min |
| [**performance.yml**](performance.yml) | Performance monitoring | Push to main + Daily | ~20-30 min |
| [**release.yml**](release.yml) | Release automation | Version tags | ~25-35 min |
| [**deploy.yml**](deploy.yml) | Deployment automation | Releases + Manual | ~15-25 min |

## 🚀 Quick Start

### For Contributors

**Before pushing code:**
```bash
# Run local CI checks
pnpm run ci

# Run affected tests only
pnpm run test:affected

# Fix linting issues
pnpm run lint:fix
```

**For pull requests:**
- All CI checks must pass
- E2E tests run automatically
- Security scans validate changes
- Performance budgets are enforced

### For Maintainers

**Creating releases:**
```bash
# Create and push version tag
git tag v1.0.0
git push origin v1.0.0

# Release workflow automatically:
# - Builds applications
# - Creates Docker images
# - Publishes GitHub release
```

**Manual deployments:**
```bash
# Deploy to staging
gh workflow run deploy.yml -f environment=staging -f version=latest

# Deploy to production
gh workflow run deploy.yml -f environment=production -f version=v1.0.0
```

## 📊 Workflow Details

### 1. Continuous Integration (ci.yml)

**Primary CI pipeline that runs on every push and PR.**

**Jobs:**
- 🏗️ **Setup**: Dependency installation and caching
- 🔍 **Code Quality**: Linting, type checking, formatting
- 📦 **Build**: Application and library builds (affected only)
- 🧪 **Test**: Unit and integration tests with coverage
- 🔐 **Security**: Basic security scanning
- ✅ **CI Success**: Final status aggregation

**Key Features:**
- Nx affected commands for efficiency
- Parallel execution where possible
- Comprehensive caching strategy
- Matrix builds for different projects

### 2. E2E Tests (e2e-tests.yml)

**Comprehensive end-to-end testing across different browsers and devices.**

**Test Suites:**
- 🖥️ **API E2E**: REST endpoint testing across Node.js versions
- 🌐 **PWA E2E**: Cross-browser testing (Chromium, Firefox, WebKit)
- 📱 **Mobile E2E**: Mobile device simulation
- 👁️ **Visual Regression**: UI consistency validation
- ♿ **Accessibility**: WCAG compliance testing

**Scheduling:**
- Triggered on push/PR
- Nightly runs at 1 AM UTC
- Manual execution available

### 3. Security Scanning (security.yml)

**Multi-layered security analysis and vulnerability detection.**

**Security Checks:**
- 📦 **Dependencies**: npm audit and vulnerability scanning
- 🔍 **Static Analysis**: CodeQL security and quality analysis
- 🔐 **Secrets**: TruffleHog secret detection
- 🐳 **Containers**: Trivy Docker image scanning
- 📄 **Licenses**: License compliance verification

**Scheduling:**
- Daily scans at 2 AM UTC
- Triggered on push/PR
- Results stored as artifacts

### 4. Performance Monitoring (performance.yml)

**Automated performance testing and regression detection.**

**Performance Tests:**
- 📊 **Bundle Analysis**: JavaScript/CSS size monitoring
- ⚡ **API Performance**: Load testing with k6
- 🌐 **Frontend Performance**: Lighthouse CI scoring
- 💾 **Resource Profiling**: Memory and CPU analysis

**Thresholds:**
- Bundle limits: 500KB JS, 100KB CSS
- API response: 95% < 500ms
- Lighthouse: Performance > 80%, Accessibility > 90%

### 5. Release Automation (release.yml)

**Automated release process triggered by version tags.**

**Release Process:**
1. 🏷️ **Validation**: Tag format and version validation
2. 📦 **Build**: Production builds with optimization
3. 🐳 **Docker**: Multi-arch container image building
4. 📋 **Release**: GitHub release with changelog
5. 🚀 **Publish**: Artifact and image publishing

**Docker Images:**
- `ghcr.io/learnfromai/nx-starter-starter-api:latest`
- `ghcr.io/learnfromai/nx-starter-starter-pwa:latest`

### 6. Deployment (deploy.yml)

**Automated deployment to staging and production environments.**

**Deployment Flow:**
1. 🔧 **Setup**: Environment configuration
2. 🚀 **Deploy**: Application deployment (API + PWA)
3. 🏥 **Health**: Health checks and validation
4. 🧪 **Smoke Tests**: Post-deployment verification
5. 💾 **Migrations**: Database migrations (production)
6. 📢 **Notify**: Status reporting

**Environments:**
- **Staging**: Automatic from develop branch
- **Production**: Manual or release-triggered

## 🔧 Configuration

### Required Secrets

Configure these in your GitHub repository settings:

```bash
# Automatically available
GITHUB_TOKEN          # GitHub API access

# Optional for deployments
DATABASE_URL          # Database connection
API_URL               # API endpoint URL
PWA_URL               # PWA endpoint URL
```

### Environment Variables

```bash
# Nx configuration
NX_CLOUD_DISTRIBUTED_EXECUTION=false
NX_REJECT_UNKNOWN_LOCAL_CACHE=0

# Container registry
REGISTRY_URL=ghcr.io
IMAGE_NAME=${{ github.repository }}
```

## 📈 Monitoring and Alerts

### Workflow Status

Monitor workflow health through:
- GitHub Actions dashboard
- Status checks on PRs
- Email notifications on failures
- Job summaries with key metrics

### Performance Tracking

Track performance over time:
- Bundle size trends
- Test execution duration
- Build time optimization
- Cache hit rates

### Security Monitoring

Stay informed about security:
- Daily vulnerability reports
- Automated security alerts
- License compliance tracking
- Container security scoring

## 🛠️ Troubleshooting

### Common Issues

**1. pnpm Version Mismatch**
```bash
# Check package.json engines requirement
"engines": {
  "pnpm": ">=10.13.1"
}
```

**2. Nx Cache Issues**
```bash
# Clear local cache
pnpm nx reset

# Check cache configuration
NX_REJECT_UNKNOWN_LOCAL_CACHE=0
```

**3. Docker Build Failures**
```bash
# Verify Dockerfile exists
ls apps/*/Dockerfile

# Check build context
docker build -f apps/starter-api/Dockerfile .
```

**4. E2E Test Timeouts**
```bash
# Increase timeout in playwright.config.ts
timeout: 30000
```

### Debug Commands

```bash
# Run specific workflow locally
act -j ci

# Test affected commands
pnpm nx show projects --affected

# Validate workflow syntax
yamllint .github/workflows/ci.yml
```

## 📚 Documentation

Detailed documentation available:
- [CI/CD Pipeline Guide](../docs/ci-cd.md)
- [GitHub Actions Best Practices](../docs/github-actions-best-practices.md)
- [Nx Monorepo Guide](../NX_README.md)
- [Clean Architecture](../README.md)

## 🤝 Contributing

When modifying workflows:

1. **Test locally** with act or manual validation
2. **Follow naming conventions** for consistency
3. **Update documentation** for significant changes
4. **Consider resource impact** on CI/CD costs
5. **Maintain backward compatibility** where possible

### Workflow Naming Convention

```yaml
name: Descriptive Name  # Title case
on: [triggers]         # Standard triggers
env:                   # Global environment
jobs:
  job-name:           # kebab-case
    name: Job Name    # Title case
```

## 🔗 External Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nx CI/CD Guide](https://nx.dev/ci/intro/ci-with-nx)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Playwright Testing](https://playwright.dev/docs/ci)

---

**Last Updated:** December 2024  
**Workflow Count:** 6 workflows  
**Total Jobs:** 25+ jobs across all workflows