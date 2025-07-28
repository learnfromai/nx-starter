# Railway.com Quick Reference

## 🚀 Quick Commands

### Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Setup Railway projects (first time)
pnpm run setup:railway:production
pnpm run setup:railway:staging
```

### Deployment
```bash
# Deploy both services to production
pnpm run deploy:railway:production

# Deploy both services to staging
pnpm run deploy:railway:staging

# Deploy only API
pnpm run deploy:railway:api

# Deploy only Web
pnpm run deploy:railway:web
```

### Management
```bash
# Check deployment status
railway status

# View logs
railway logs

# Open in browser
railway open

# Connect to database
railway connect postgresql

# Set environment variable
railway variables set KEY=value

# View environment variables
railway variables
```

## 🌐 Service URLs

### Production
- **API**: `https://nx-starter-api-production.railway.app`
- **Web**: `https://nx-starter-web-production.railway.app`
- **Health**: `https://nx-starter-api-production.railway.app/api/health`

### Staging
- **API**: `https://nx-starter-api-staging.railway.app`
- **Web**: `https://nx-starter-web-staging.railway.app`
- **Health**: `https://nx-starter-api-staging.railway.app/api/health`

## 🔑 Required Secrets

### GitHub Actions
- `RAILWAY_TOKEN`: Railway API token
- `JWT_SECRET_PROD`: Production JWT secret
- `JWT_SECRET_STAGING`: Staging JWT secret

### Railway Environment Variables
- `JWT_SECRET`: Set in Railway dashboard
- `DATABASE_URL`: Auto-provided by Railway PostgreSQL
- `PORT`: Auto-provided by Railway
- `RAILWAY_PORT`: Auto-provided by Railway

## 📁 Important Files

```
railway.toml                    # Railway configuration
apps/api/Dockerfile            # API container config
apps/web/Dockerfile            # Web container config
apps/web/nginx.conf            # Web server config
railway-api.env                # API environment template
railway-web.env                # Web environment template
scripts/deploy-railway.sh      # Main deployment script
docs/RAILWAY_DEPLOYMENT.md     # Full documentation
```

## 🔧 Troubleshooting

### Common Issues
1. **Build fails**: Check pnpm version and dependencies
2. **Database connection**: Verify `DATABASE_URL` is set
3. **CORS errors**: Update `CORS_ORIGIN` environment variable
4. **Port issues**: Railway sets `PORT` automatically

### Debug Commands
```bash
# View build logs
railway logs --service your-service

# Check environment variables
railway variables --service your-service

# Test database connection
railway connect postgresql

# Check service status
railway status --service your-service
```

## 📞 Support Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://railway.app/discord
- **Full Guide**: [docs/RAILWAY_DEPLOYMENT.md](docs/RAILWAY_DEPLOYMENT.md)