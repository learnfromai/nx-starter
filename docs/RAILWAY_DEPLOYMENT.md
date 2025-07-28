# Railway.com Deployment Guide

This guide explains how to deploy the Nx Starter applications to Railway.com. The project consists of two separate deployments:

- **API Service**: Node.js web service (Express.js backend)
- **Web Application**: Static site (React frontend)

## Prerequisites

1. **Railway Account**: Create an account at [Railway.app](https://railway.app)
2. **Railway CLI**: Install the Railway CLI for local deployments
3. **GitHub Integration**: Connect your GitHub repository to Railway
4. **Environment Variables**: Configure the required environment variables

## Quick Setup

### 1. Install Railway CLI

```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows
iwr https://railway.app/install.ps1 | iex
```

### 2. Login to Railway

```bash
railway login
```

### 3. Create Railway Projects

You need to create two separate Railway projects:

```bash
# Create API service
railway new
# Choose "Empty Project"
# Name it: nx-starter-api

# Create Web service  
railway new
# Choose "Empty Project"
# Name it: nx-starter-web
```

## Manual Deployment

### API Service Deployment

1. **Navigate to API directory**:
   ```bash
   cd apps/api
   ```

2. **Link to Railway project**:
   ```bash
   railway link
   # Select your nx-starter-api project
   ```

3. **Set environment variables**:
   ```bash
   # Copy Railway environment template
   cp .env.railway .env.local
   
   # Edit and set your variables
   railway variables set NODE_ENV=production
   railway variables set PORT=\$PORT
   railway variables set HOST=0.0.0.0
   railway variables set CORS_ORIGIN=https://your-web-domain.railway.app
   railway variables set JWT_SECRET=your-super-secure-jwt-secret
   
   # Optional: Add database URL if using Railway database
   railway variables set DATABASE_URL=\$DATABASE_URL
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

### Web Application Deployment

1. **Navigate to Web directory**:
   ```bash
   cd apps/web
   ```

2. **Link to Railway project**:
   ```bash
   railway link
   # Select your nx-starter-web project
   ```

3. **Set environment variables**:
   ```bash
   # Copy Railway environment template
   cp .env.railway .env.local
   
   # Set API URL
   railway variables set VITE_API_BASE_URL=https://your-api-domain.railway.app
   railway variables set VITE_ENVIRONMENT=production
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

## GitHub Actions Deployment

### 1. Setup Repository Secrets

In your GitHub repository, go to Settings > Secrets and variables > Actions and add:

- `RAILWAY_TOKEN`: Your Railway API token (get from Railway dashboard)
- `RAILWAY_API_SERVICE_ID`: API service ID from Railway dashboard
- `RAILWAY_WEB_SERVICE_ID`: Web service ID from Railway dashboard
- `RAILWAY_API_DOMAIN`: Your API service domain (e.g., `api-service.railway.app`)
- `RAILWAY_WEB_DOMAIN`: Your Web service domain (e.g., `web-app.railway.app`)
- `RAILWAY_DATABASE_URL`: (Optional) Database URL if using Railway database

### 2. Configure GitHub Environments

1. Go to Settings > Environments
2. Create two environments:
   - `railway-api`
   - `railway-web`
3. Add protection rules as needed

### 3. Automatic Deployment

The GitHub Actions workflow will automatically deploy when:
- Code is pushed to the `main` branch
- Manual workflow dispatch is triggered

## Environment Configuration

### API Service Environment Variables

Copy the variables from `apps/api/.env.railway` and set them in Railway:

**Required Variables:**
- `NODE_ENV=production`
- `PORT=$PORT` (Railway automatically provides this)
- `HOST=0.0.0.0`
- `CORS_ORIGIN=https://your-web-domain.railway.app`
- `JWT_SECRET=your-secure-secret`

**Database Options:**

1. **SQLite** (default, simplest):
   ```
   DB_TYPE=sqlite
   DB_ORM=native
   DATABASE_URL=./data/todos.db
   ```

2. **Railway PostgreSQL**:
   ```
   DB_TYPE=postgresql
   DB_ORM=typeorm
   DATABASE_URL=$DATABASE_URL
   ```

3. **Railway MySQL**:
   ```
   DB_TYPE=mysql
   DB_ORM=typeorm
   DATABASE_URL=$DATABASE_URL
   ```

### Web Application Environment Variables

Copy the variables from `apps/web/.env.railway` and set them in Railway:

**Required Variables:**
- `VITE_ENVIRONMENT=production`
- `VITE_API_BASE_URL=https://your-api-domain.railway.app`
- `VITE_USE_API_BACKEND=true`

## Database Setup

### Option 1: Railway PostgreSQL (Recommended)

1. **Add database to API project**:
   ```bash
   railway add postgresql
   ```

2. **Update environment variables**:
   ```bash
   railway variables set DB_TYPE=postgresql
   railway variables set DB_ORM=typeorm
   railway variables set DATABASE_URL=\$DATABASE_URL
   ```

### Option 2: Railway MySQL

1. **Add database to API project**:
   ```bash
   railway add mysql
   ```

2. **Update environment variables**:
   ```bash
   railway variables set DB_TYPE=mysql
   railway variables set DB_ORM=typeorm
   railway variables set DATABASE_URL=\$DATABASE_URL
   ```

### Option 3: SQLite (Default)

No additional setup required. Data is stored in Railway's persistent volume.

## Custom Domains

1. **In Railway Dashboard**:
   - Go to your service settings
   - Click "Domains"
   - Add your custom domain
   - Update DNS records as shown

2. **Update Environment Variables**:
   ```bash
   # For API service
   railway variables set CORS_ORIGIN=https://yourdomain.com
   railway variables set JWT_ISSUER=api.yourdomain.com
   railway variables set JWT_AUDIENCE=yourdomain.com
   
   # For Web service
   railway variables set VITE_API_BASE_URL=https://api.yourdomain.com
   ```

## Monitoring and Logs

### View Logs
```bash
# API service logs
cd apps/api
railway logs

# Web service logs
cd apps/web
railway logs
```

### Metrics and Monitoring

Railway provides built-in metrics. You can also enable custom metrics by setting:
```bash
railway variables set METRICS_ENABLED=true
```

Access metrics at: `https://your-api-domain.railway.app/metrics`

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Railway build logs
   - Verify pnpm version matches (10.13.1)
   - Ensure all dependencies are in package.json

2. **API Health Check Fails**:
   - Verify PORT environment variable is set correctly
   - Check CORS configuration
   - Review application logs

3. **Web App Can't Connect to API**:
   - Verify VITE_API_BASE_URL is correct
   - Check CORS_ORIGIN in API service
   - Ensure both services are deployed

### Debug Commands

```bash
# Check service status
railway status

# View environment variables
railway variables

# Connect to service shell
railway shell

# View build logs
railway logs --build
```

### Local Testing with Railway Environment

```bash
# Test API with Railway environment
cd apps/api
railway run pnpm start

# Test Web with Railway environment  
cd apps/web
railway run pnpm dev
```

## Best Practices

1. **Security**:
   - Use strong JWT secrets
   - Enable HTTPS only
   - Set appropriate CORS origins
   - Regularly rotate secrets

2. **Performance**:
   - Enable gzip compression
   - Use Railway's CDN for static assets
   - Monitor response times

3. **Reliability**:
   - Set up health checks
   - Configure proper error handling
   - Monitor application logs

4. **Cost Optimization**:
   - Use Railway's sleep mode for development
   - Monitor usage and scale appropriately
   - Consider database connection pooling

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/cli/quick-start)
- [Railway Environment Variables](https://docs.railway.app/environment-variables)
- [Railway Domains](https://docs.railway.app/domains)