# Railway.com Deployment Guide

This guide explains how to deploy the NX Starter applications to Railway.com. The project is configured to deploy the API (web service) and Web application (static site) as separate Railway services.

## 🚂 Overview

Railway.com provides a modern platform for deploying applications with automatic builds, deployments, and scaling. Our setup includes:

- **API Service**: Node.js web service deployed from `apps/api`
- **Web Application**: Static site deployed from `apps/web`
- **Automatic Deployments**: Triggered on pushes to the `main` branch
- **Environment Management**: Separate production configurations

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Connected to Railway
3. **Railway CLI**: For local development and debugging

### Install Railway CLI

```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# npm
npm install -g @railway/cli
```

## 🛠️ Initial Setup

### 1. Create Railway Projects

Create two separate Railway projects:

1. **API Service Project**
   ```bash
   railway login
   railway new
   # Choose "Empty Project"
   # Name it "nx-starter-api"
   ```

2. **Web Application Project**
   ```bash
   railway new
   # Choose "Empty Project" 
   # Name it "nx-starter-web"
   ```

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

#### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `RAILWAY_TOKEN` | Railway CLI token | `YOUR_RAILWAY_TOKEN` |
| `RAILWAY_API_PROJECT_ID` | API project ID from Railway | `abc123...` |
| `RAILWAY_WEB_PROJECT_ID` | Web project ID from Railway | `def456...` |
| `JWT_SECRET` | Production JWT secret | `your-secure-jwt-secret-32chars+` |
| `CORS_ORIGIN` | Production web app URL | `https://your-app.railway.app` |
| `API_BASE_URL` | Production API URL | `https://your-api.railway.app` |

#### How to Get Railway Token

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your profile → Settings
3. Go to "Tokens" tab
4. Create a new token with appropriate permissions
5. Copy the token value

#### How to Get Project IDs

1. Open your Railway project
2. Go to Settings → General
3. Copy the "Project ID"

### 3. Connect GitHub Repository

For each Railway project:

1. Go to project settings
2. Connect your GitHub repository
3. Set the root directory:
   - **API Project**: Set root directory to `apps/api`
   - **Web Project**: Set root directory to `apps/web`

## 🔧 Configuration Files

### API Configuration (`apps/api/railway.json`)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build:libs && pnpm build:api"
  },
  "deploy": {
    "startCommand": "node dist/apps/api/main.js",
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Web Configuration (`apps/web/railway.json`)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build:libs && pnpm build:web"
  },
  "deploy": {
    "staticFilePath": "dist/apps/web"
  }
}
```

## 🌍 Environment Variables

### API Service Environment Variables

Set these in Railway dashboard for your API project:

```bash
# Core Configuration
NODE_ENV=production
ENVIRONMENT=production
HOST=0.0.0.0
PORT=3000  # Railway will automatically set this

# API Configuration
API_PREFIX=/api
API_VERSION=v1

# Security
JWT_SECRET=your-secure-jwt-secret-32chars+
CORS_ORIGIN=https://your-web-app.railway.app

# Database (configure as needed)
DB_TYPE=memory  # or sqlite, mysql, postgresql, mongodb
DB_ORM=native   # or typeorm, sequelize, mongoose

# Optional: Database URL
# DATABASE_URL=your-database-connection-string
```

### Web Application Environment Variables

Set these in Railway dashboard for your Web project:

```bash
# Environment
VITE_ENVIRONMENT=production

# API Integration
VITE_USE_API_BACKEND=true
VITE_API_BASE_URL=https://your-api.railway.app
VITE_API_TIMEOUT=10000

# Application
VITE_APP_NAME="Nx Starter"
VITE_APP_VERSION="1.0.0"

# Features
VITE_ENABLE_AUTH=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_PWA=true
```

## 🚀 Deployment Process

### Automatic Deployment

Deployments are triggered automatically when:

1. Code is pushed to the `main` branch
2. Changes are detected in relevant application files
3. Manual workflow dispatch is triggered

### Manual Deployment

You can manually trigger deployments:

1. **GitHub Actions**:
   ```
   Go to Actions → Deploy to Railway → Run workflow
   ```

2. **Railway CLI**:
   ```bash
   # Deploy API
   cd apps/api
   railway login
   railway link YOUR_API_PROJECT_ID
   railway up

   # Deploy Web
   cd apps/web
   railway login
   railway link YOUR_WEB_PROJECT_ID
   railway up
   ```

## 🔍 Monitoring and Debugging

### Health Checks

- **API Health**: `https://your-api.railway.app/api/v1/health`
- **Web Health**: `https://your-web-app.railway.app`

### Logs

View application logs in Railway dashboard:

1. Go to your project
2. Click on the service
3. Navigate to "Logs" tab
4. Filter by log level as needed

### Common Issues

#### Build Failures

```bash
# Check build logs in Railway dashboard
# Ensure all dependencies are in package.json
# Verify build commands in railway.json
```

#### Environment Variable Issues

```bash
# Check that all required environment variables are set
# Verify variable names match exactly
# Ensure no typos in secret names
```

#### Health Check Failures

```bash
# Verify health endpoint is accessible
# Check that server is listening on correct port
# Ensure HOST is set to 0.0.0.0
```

## 📊 Deployment Monitoring

### GitHub Actions Status

Monitor deployments in GitHub Actions:

1. Go to your repository
2. Click on "Actions" tab
3. View "Deploy to Railway" workflow runs
4. Check deployment summary for status

### Railway Dashboard

Monitor application metrics:

1. Resource usage (CPU, Memory, Network)
2. Request metrics and response times
3. Error rates and logs
4. Deployment history

## 🔄 Rollback Procedures

### Automatic Rollback

If health checks fail, the deployment will automatically fail and previous version remains active.

### Manual Rollback

1. **Railway Dashboard**:
   - Go to Deployments tab
   - Click on a previous successful deployment
   - Click "Redeploy"

2. **Railway CLI**:
   ```bash
   railway rollback
   ```

3. **GitHub Actions**:
   - Revert the problematic commit
   - Push to trigger new deployment

## 🔐 Security Considerations

### Environment Variables

- Never commit secrets to version control
- Use GitHub Secrets for sensitive data
- Rotate JWT secrets regularly
- Use strong, unique passwords

### Network Security

- Configure CORS origins properly
- Use HTTPS in production
- Implement rate limiting
- Monitor for suspicious activity

### Database Security

- Use secure connection strings
- Enable SSL for database connections
- Implement proper authentication
- Regular security updates

## 🆘 Support and Troubleshooting

### Getting Help

1. **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
2. **Railway Discord**: Join the Railway community
3. **GitHub Issues**: Create issues in this repository
4. **Railway Support**: Contact Railway support for platform issues

### Common Commands

```bash
# Check Railway status
railway status

# View logs
railway logs

# Open Railway dashboard
railway open

# List environment variables
railway variables

# Connect to database (if applicable)
railway connect
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Nixpacks Documentation](https://nixpacks.com)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)