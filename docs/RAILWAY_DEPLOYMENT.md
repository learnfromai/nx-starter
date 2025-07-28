# Railway.com Deployment Guide

This guide walks you through deploying the Nx Starter application to Railway.com. The application consists of two separate services that will be deployed independently:

- **API Service**: Node.js Express backend (`apps/api`)
- **Web Service**: React PWA frontend (`apps/web`)

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Railway CLI** (optional): Install with `npm install -g @railway/cli`

## Deployment Overview

Railway deployment uses Docker containers for both services. Each service has:
- `Dockerfile` - Container build instructions
- `railway.toml` - Railway-specific configuration
- `.env.railway.example` - Environment variable templates

## Step-by-Step Deployment

### 1. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2. Set Up the Database (API Dependency)

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Wait for the database to be provisioned
4. Note the service name (e.g., "Postgres")

### 3. Deploy the API Service

1. Click "New Service" → "GitHub Repo"
2. Select your repository
3. **Configure the service:**
   - **Service Name**: `api` (or your preferred name)
   - **Root Directory**: Leave empty (Railway will use the Dockerfile path)
   - **Build Command**: Will use Docker automatically

4. **Set Environment Variables:**
   - Go to the API service → "Variables" tab
   - Copy variables from `apps/api/.env.railway.example`
   - **Critical variables to set:**
     ```
     NODE_ENV=production
     ENVIRONMENT=production
     HOST=0.0.0.0
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-super-secure-secret-key-32-chars-minimum
     CORS_ORIGIN=https://${{web.RAILWAY_PUBLIC_DOMAIN}}
     ```

5. **Deploy**: Railway will automatically build and deploy using the Dockerfile

### 4. Deploy the Web Service

1. Click "New Service" → "GitHub Repo"
2. Select your repository again
3. **Configure the service:**
   - **Service Name**: `web` (or your preferred name)
   - **Root Directory**: Leave empty

4. **Set Environment Variables:**
   - Go to the Web service → "Variables" tab
   - Copy variables from `apps/web/.env.railway.example`
   - **Critical variables to set:**
     ```
     VITE_ENVIRONMENT=production
     VITE_USE_API_BACKEND=true
     VITE_API_BASE_URL=https://${{api.RAILWAY_PUBLIC_DOMAIN}}
     VITE_APP_NAME=Nx Starter PWA
     ```

5. **Deploy**: Railway will automatically build and deploy using the Dockerfile

### 5. Configure Service Connections

After both services are deployed:

1. **Update API CORS**: In API service variables, ensure `CORS_ORIGIN` points to your web service:
   ```
   CORS_ORIGIN=https://${{web.RAILWAY_PUBLIC_DOMAIN}}
   ```

2. **Update Web API URL**: In Web service variables, ensure `VITE_API_BASE_URL` points to your API service:
   ```
   VITE_API_BASE_URL=https://${{api.RAILWAY_PUBLIC_DOMAIN}}
   ```

## Environment Variables Reference

### API Service Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `DATABASE_URL` | PostgreSQL connection | `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-32-chars-min` |
| `CORS_ORIGIN` | Allowed origin for CORS | `https://${{web.RAILWAY_PUBLIC_DOMAIN}}` |

### Web Service Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_ENVIRONMENT` | Build environment | `production` |
| `VITE_API_BASE_URL` | API service URL | `https://${{api.RAILWAY_PUBLIC_DOMAIN}}` |
| `VITE_USE_API_BACKEND` | Enable API calls | `true` |

## Custom Domains (Optional)

1. Go to your service in Railway dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update environment variables to use custom domains instead of Railway domains

## Monitoring and Logs

- **Logs**: Click on any service → "Logs" tab to view real-time logs
- **Metrics**: Click on any service → "Metrics" tab for performance data
- **Health Checks**: Both services include health check endpoints:
  - API: `/api/health`
  - Web: `/health`

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check the build logs in Railway dashboard
   - Ensure Docker builds work locally first
   - Verify pnpm version compatibility

2. **API Connection Issues**:
   - Verify `CORS_ORIGIN` in API service
   - Check `VITE_API_BASE_URL` in Web service
   - Ensure database is connected properly

3. **Environment Variables**:
   - Double-check variable names (case-sensitive)
   - Ensure service references use correct names
   - Verify secrets are properly set

### Testing Locally with Docker

Test your Docker configurations locally before deploying:

```bash
# Build and test API
cd apps/api
docker build -t nx-starter-api .
docker run -p 4000:4000 nx-starter-api

# Build and test Web
cd apps/web  
docker build -t nx-starter-web .
docker run -p 80:80 nx-starter-web
```

## Security Considerations

1. **JWT Secret**: Use a strong, random secret (minimum 32 characters)
2. **Environment Variables**: Never commit real secrets to the repository
3. **CORS**: Configure properly to allow only your web application
4. **Database**: Use Railway's managed PostgreSQL for security and backups

## Cost Optimization

- **Scaling**: Configure auto-scaling based on your traffic needs
- **Resources**: Monitor resource usage and adjust as needed
- **Regions**: Deploy in regions closest to your users

## Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Community**: Join Railway's Discord for community support
- **Issues**: Report deployment issues in this repository