# Railway.com Deployment Guide

This guide explains how to deploy the Nx Starter application to Railway.com. The deployment includes both the API service and Web application as separate Railway services.

## 📋 Prerequisites

1. **Railway Account**: [Sign up at Railway.com](https://railway.app)
2. **Railway CLI**: `npm install -g @railway/cli`
3. **GitHub Repository**: Connected to Railway for auto-deployments
4. **Environment Variables**: Properly configured secrets

## 🏗️ Architecture Overview

```
Railway Deployment Architecture

┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   API Service   │
│   (Static Site) │────│   (Web Service) │
│   Port: 3000    │    │   Port: 4000    │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
    ┌─────────────────────────────────┐
    │     Railway PostgreSQL      │
    │        Database            │
    └─────────────────────────────────┘
```

## 🚀 Quick Start Deployment

### Option 1: Manual Deployment (Recommended for first time)

1. **Login to Railway**:
   ```bash
   railway login
   ```

2. **Deploy API Service**:
   ```bash
   ./scripts/deploy-api-railway.sh
   ```

3. **Deploy Web Application**:
   ```bash
   ./scripts/deploy-web-railway.sh
   ```

### Option 2: Complete Deployment Script

```bash
# Deploy both services to production
./scripts/deploy-railway.sh both production

# Deploy only API to staging
./scripts/deploy-railway.sh api staging

# Deploy only Web to production
./scripts/deploy-railway.sh web production
```

## 📦 Railway Project Setup

### 1. Create Railway Projects

Create two separate Railway projects:

1. **API Service**: `nx-starter-api`
2. **Web Application**: `nx-starter-web`

### 2. Database Setup

1. Add PostgreSQL service to your API project
2. Railway will automatically provide the `DATABASE_URL` environment variable

### 3. Environment Variables

#### API Service Environment Variables

Copy variables from `railway-api.env` to your Railway API project:

**Required Secrets (Set in Railway Dashboard)**:
- `JWT_SECRET`: Strong secret key for JWT tokens
- `DATABASE_URL`: Automatically provided by Railway PostgreSQL

**Environment Variables**:
```bash
NODE_ENV=production
ENVIRONMENT=production
PORT=${RAILWAY_PORT}
HOST=0.0.0.0
DB_TYPE=postgresql
DB_ORM=typeorm
CORS_ORIGIN=${RAILWAY_STATIC_URL}
# ... (see railway-api.env for complete list)
```

#### Web Application Environment Variables

Copy variables from `railway-web.env` to your Railway Web project:

```bash
NODE_ENV=production
ENVIRONMENT=production
PORT=${RAILWAY_PORT}
VITE_USE_API_BACKEND=true
VITE_API_BASE_URL=${RAILWAY_API_URL}
# ... (see railway-web.env for complete list)
```

## 🔧 Deployment Configurations

### Docker-based Deployment

Both services use Docker for consistent deployments:

- **API**: `apps/api/Dockerfile`
- **Web**: `apps/web/Dockerfile` (with nginx)

### Railway Configuration

The `railway.toml` file configures:
- Build commands
- Start commands
- Environment variables
- Health checks

## 🌍 Environment Management

### Production Environment

- **Trigger**: Git tags (`v*`) or manual workflow dispatch
- **Services**: Both API and Web
- **Database**: Railway PostgreSQL
- **Monitoring**: Full logging and metrics

### Staging Environment

- **Trigger**: Push to `main` branch or manual dispatch
- **Services**: Both API and Web
- **Database**: Separate staging PostgreSQL
- **Monitoring**: Debug logging enabled

## 🔄 CI/CD with GitHub Actions

The project includes automated deployment via GitHub Actions:

### Workflow: `.github/workflows/deploy-railway.yml`

**Triggers**:
- Push to `main` → Staging deployment
- Git tags `v*` → Production deployment
- Manual dispatch → Choose environment and service

**Required GitHub Secrets**:
```bash
RAILWAY_TOKEN=your_railway_api_token
JWT_SECRET_PROD=your_production_jwt_secret
JWT_SECRET_STAGING=your_staging_jwt_secret
```

### Setting up GitHub Secrets

1. Go to Repository Settings → Secrets and Variables → Actions
2. Add the required secrets listed above
3. Get Railway token from [Railway Dashboard → Account → Tokens](https://railway.app/account/tokens)

## 🔍 Monitoring and Health Checks

### Health Check Endpoints

- **API Health**: `https://your-api.railway.app/api/health`
- **Web Health**: `https://your-web.railway.app/health`

### Logging

Railway provides real-time logs for both services:

```bash
# View API logs
railway logs --service nx-starter-api

# View Web logs
railway logs --service nx-starter-web
```

### Metrics

The API service exposes metrics at `/metrics` endpoint for monitoring.

## 🗄️ Database Management

### Initial Setup

Railway PostgreSQL is automatically configured with:
- SSL enabled
- Connection pooling
- Automatic backups

### Migrations

Database migrations run automatically on deployment. For manual migrations:

```bash
# Connect to Railway PostgreSQL
railway connect postgresql

# Or run migrations via API service
railway run --service nx-starter-api npm run migration:run
```

## 🔒 Security Considerations

### Environment Variables

- Store sensitive data (JWT secrets, API keys) in Railway secrets
- Use different secrets for staging and production
- Rotate secrets regularly

### CORS Configuration

Update CORS origins to match your deployed domains:

```bash
CORS_ORIGIN=https://your-domain.com,https://staging.your-domain.com
```

### SSL/TLS

Railway provides automatic HTTPS for all deployments.

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build logs
   railway logs --service your-service
   
   # Rebuild locally
   pnpm run build:prod
   ```

2. **Database Connection Issues**:
   ```bash
   # Verify DATABASE_URL is set
   railway variables --service nx-starter-api
   
   # Test database connection
   railway connect postgresql
   ```

3. **CORS Errors**:
   - Update `CORS_ORIGIN` environment variable
   - Ensure domains match exactly (including protocol)

4. **Deployment Timeouts**:
   - Check Railway service limits
   - Optimize Docker images
   - Review build performance

### Getting Help

1. **Railway Logs**: `railway logs --service your-service`
2. **Railway Status**: `railway status --service your-service`
3. **Railway Docs**: [docs.railway.app](https://docs.railway.app)
4. **Railway Discord**: [railway.app/discord](https://railway.app/discord)

## 📈 Scaling and Performance

### Scaling Options

Railway provides automatic scaling based on:
- CPU usage
- Memory usage
- Request volume

### Performance Optimization

1. **API Service**:
   - Enable connection pooling
   - Use caching (Redis addon)
   - Optimize database queries

2. **Web Application**:
   - Enable gzip compression (nginx)
   - Use CDN for static assets
   - Implement service worker caching

## 🔄 Rollback Strategy

### Automated Rollback

Railway supports instant rollbacks:

```bash
# View deployments
railway deployments --service your-service

# Rollback to previous deployment
railway rollback --service your-service deployment-id
```

### Manual Rollback

1. Revert to previous Git commit
2. Trigger deployment
3. Update environment variables if needed

## 📝 Maintenance

### Regular Tasks

1. **Update Dependencies**: Monthly
2. **Rotate Secrets**: Quarterly
3. **Review Logs**: Weekly
4. **Database Backups**: Automated by Railway
5. **Performance Review**: Monthly

### Monitoring Checklist

- [ ] Health checks are passing
- [ ] Error rates are within acceptable limits
- [ ] Response times are optimal
- [ ] Database performance is good
- [ ] Logs show no critical errors

## 🤝 Contributing

When contributing to deployment configurations:

1. Test changes in staging first
2. Update environment variable documentation
3. Verify health checks work
4. Update this documentation if needed

## 📞 Support

For deployment issues:

1. Check this documentation
2. Review Railway logs and status
3. Test locally with production configuration
4. Contact Railway support for platform issues