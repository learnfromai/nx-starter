# 🚀 Railway.com Deployment Guide

This guide explains how to deploy both the API service and web application to Railway.com as separate services.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code must be in a GitHub repository
3. **Local Setup**: Ensure you can build both apps locally:
   ```bash
   pnpm install
   pnpm run build:api
   pnpm run build:web
   ```

## 🏗️ Architecture Overview

This deployment creates **two separate Railway services**:

- **API Service** (`apps/api`): Node.js backend service
- **Web Service** (`apps/web`): Static site hosting for React PWA

```
┌─────────────────┐    ┌─────────────────┐
│   Web Service   │────▶│   API Service   │
│   (Static Site) │    │   (Node.js App) │
│                 │    │                 │
│ Railway Static  │    │ Railway Service │
└─────────────────┘    └─────────────────┘
```

## 🔧 Setup Instructions

### Step 1: Connect Repository to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. **Important**: You'll create two separate services from the same repo

### Step 2: Deploy API Service

1. **Create the API service:**
   - Click **"Add Service"** in your Railway project
   - Select **"GitHub Repo"**
   - Choose your repository again
   - Set **Root Directory** to: `apps/api`

2. **Configure the API service:**
   - Railway will detect it's a Node.js app automatically
   - The `apps/api/railway.json` file will configure the build and deployment
   - The build command will run: `cd ../.. && pnpm install && pnpm build:api`
   - The start command will be: `node main.js`

3. **Set environment variables:**
   - Go to the service **Variables** tab
   - Copy variables from `apps/api/.env.railway`
   - **Critical variables to set:**
     ```bash
     NODE_ENV=production
     JWT_SECRET=your-secure-secret-here
     CORS_ORIGIN=https://your-web-service.railway.app
     ```

4. **Add database (recommended):**
   - Click **"Add Service"** → **"Database"** → **"PostgreSQL"**
   - Railway will automatically set `DATABASE_URL` environment variable
   - Update your API's `DB_TYPE=postgresql` and `DB_ORM=typeorm`

### Step 3: Deploy Web Service

1. **Create the web service:**
   - Click **"Add Service"** in your Railway project
   - Select **"GitHub Repo"**
   - Choose your repository again
   - Set **Root Directory** to: `apps/web`

2. **Configure the web service:**
   - Railway will detect it's a static site
   - The `apps/web/railway.json` file will configure the build
   - The build command will run: `cd ../.. && pnpm install && pnpm build:web`
   - Static files will be served from: `../../dist/apps/web`

3. **Set environment variables:**
   - Go to the service **Variables** tab
   - Copy variables from `apps/web/.env.railway`
   - **Critical variable to set:**
     ```bash
     REACT_APP_API_BASE_URL=https://your-api-service.railway.app
     ```

### Step 4: Configure Cross-Service Communication

1. **Get service URLs:**
   - Each service gets a unique Railway URL (e.g., `https://service-name.railway.app`)
   - Note both URLs

2. **Update API CORS:**
   - In your API service variables, set:
     ```bash
     CORS_ORIGIN=https://your-web-service.railway.app
     ```

3. **Update Web API URL:**
   - In your web service variables, set:
     ```bash
     REACT_APP_API_BASE_URL=https://your-api-service.railway.app
     ```

4. **Redeploy both services** after updating environment variables

## 🔧 Local Testing Scripts

Test your Railway setup locally:

```bash
# Test API build for Railway
./scripts/deploy-api-railway.sh

# Test web build for Railway
./scripts/deploy-web-railway.sh
```

## 🌐 Custom Domains (Optional)

1. **Add custom domains** in Railway:
   - Go to service **Settings** → **Domains**
   - Add your custom domain
   - Update CORS_ORIGIN and REACT_APP_API_BASE_URL accordingly

2. **Update environment variables** with your custom domains:
   ```bash
   # API Service
   CORS_ORIGIN=https://app.yourdomain.com
   
   # Web Service  
   REACT_APP_API_BASE_URL=https://api.yourdomain.com
   ```

## 📊 Monitoring & Logs

- **View logs**: Go to service → **Deployments** → Click on deployment
- **Monitor metrics**: Railway provides CPU, memory, and network metrics
- **Health checks**: API includes `/api/health` endpoint for monitoring

## 🔒 Environment Variables Reference

### API Service Variables
See `apps/api/.env.railway` for complete list. Key variables:

```bash
# Server
PORT=$PORT                    # Railway sets this automatically
NODE_ENV=production
ENVIRONMENT=production

# Security  
JWT_SECRET=your-secure-secret # CHANGE THIS!
CORS_ORIGIN=https://your-web-app.railway.app

# Database
DATABASE_URL=$DATABASE_URL    # Railway sets this with database add-on
DB_TYPE=postgresql
DB_ORM=typeorm
```

### Web Service Variables
See `apps/web/.env.railway` for complete list. Key variables:

```bash
# API Connection
REACT_APP_API_BASE_URL=https://your-api-service.railway.app

# App Config
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_DEBUG=false
```

## 🚨 Security Checklist

- [ ] Change default JWT_SECRET to a secure random string (32+ characters)
- [ ] Set CORS_ORIGIN to your actual web app domain
- [ ] Enable database SSL (DB_SSL_ENABLED=true)
- [ ] Review all environment variables before production
- [ ] Enable Railway's built-in DDoS protection
- [ ] Consider setting up monitoring and alerting

## 🔄 CI/CD Integration

Railway automatically deploys when you push to your connected branch. For more control:

1. **Set up branch-based deployments:**
   - Production: Deploy from `main` branch
   - Staging: Deploy from `develop` branch

2. **Use Railway CLI** for advanced deployments:
   ```bash
   npm install -g @railway/cli
   railway login
   railway deploy
   ```

## 🛠️ Troubleshooting

### Common Issues:

1. **Build fails with "pnpm not found":**
   - Railway should auto-detect pnpm from `pnpm-lock.yaml`
   - If not, add `"packageManager": "pnpm@10.13.1"` to root `package.json`

2. **API can't connect to database:**
   - Ensure `DATABASE_URL` is set in Railway
   - Check that `DB_SSL_ENABLED=true` for Railway PostgreSQL

3. **CORS errors between web and API:**
   - Verify `CORS_ORIGIN` in API matches web service URL
   - Ensure both services are deployed and URLs are correct

4. **Environment variables not updating:**
   - Redeploy the service after changing variables
   - Check variable names match exactly (case-sensitive)

### Getting Help:

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [railway.app/discord](https://railway.app/discord)
- **Project Issues**: Create an issue in this repository

## 📈 Scaling & Production Considerations

- **Database**: Use Railway PostgreSQL add-on for production
- **Monitoring**: Set up monitoring and alerts
- **Backups**: Configure database backups
- **CDN**: Consider adding a CDN for static assets
- **Logs**: Set up log aggregation for production debugging

---

## 🎯 Quick Start Summary

1. **Connect repo** to Railway
2. **Create API service** with root directory `apps/api`
3. **Add PostgreSQL database**
4. **Create web service** with root directory `apps/web`
5. **Set environment variables** from `.env.railway` files
6. **Update CORS and API URLs** between services
7. **Deploy and test!**

Your apps will be available at:
- **Web App**: `https://your-web-service.railway.app`
- **API**: `https://your-api-service.railway.app`
- **API Health**: `https://your-api-service.railway.app/api/health`