# Cloud Run Deployment Guide

## Overview

This guide will help you deploy the Decoopa backend to Google Cloud Run.

## Prerequisites

### 1. Install Required Tools

#### Google Cloud CLI
```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Download from: https://cloud.google.com/sdk/docs/install
```

#### Docker
```bash
# macOS
brew install --cask docker

# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Windows
# Download from: https://docs.docker.com/desktop/install/windows-install/
```

### 2. Authentication

```bash
# Login to Google Cloud
gcloud auth login

# Set the project
gcloud config set project decoopa-50ce2

# Verify authentication
gcloud auth list
```

## Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

```bash
# Navigate to the backend directory
cd backend

# Run the deployment script
./deploy-cloud-run.sh
```

### Option 2: Manual Deployment

```bash
# 1. Build and push the Docker image
gcloud builds submit --tag europe-west3-docker.pkg.dev/decoopa-50ce2/decoopa-docker-repo/decoopa:latest .

# 2. Deploy to Cloud Run
gcloud run deploy decoopa \
    --image europe-west3-docker.pkg.dev/decoopa-50ce2/decoopa-docker-repo/decoopa:latest \
    --region europe-west3 \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 5 \
    --timeout 300 \
    --concurrency 80 \
    --execution-environment gen2 \
    --cpu-boost
```

## Configuration

### Environment Variables

The deployment script automatically sets these environment variables:

- `NODE_ENV=production`
- `ENV=production`
- `ALGOLIA_*` - Search configuration
- `KASHIER_*` - Payment gateway configuration
- `WALLET_BALANCE_KEY` - Wallet encryption key
- `MYLERZ_*` - Delivery service configuration

### Service Configuration

- **Memory**: 1Gi
- **CPU**: 1 vCPU
- **Max Instances**: 5
- **Timeout**: 300 seconds
- **Concurrency**: 80 requests per instance
- **Execution Environment**: Gen2
- **CPU Boost**: Enabled

## Monitoring

### View Logs

```bash
# Real-time logs
gcloud logs tail --service=decoopa --region=europe-west3

# Recent logs
gcloud logs read --service=decoopa --region=europe-west3 --limit=50
```

### Check Service Status

```bash
# Get service details
gcloud run services describe decoopa --region=europe-west3

# List all services
gcloud run services list --region=europe-west3
```

### Health Check

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe decoopa --region=europe-west3 --format="value(status.url)")

# Test health endpoint
curl $SERVICE_URL/health
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
gcloud builds log [BUILD_ID]

# Rebuild with more verbose output
gcloud builds submit --verbosity=debug .
```

#### 2. Deployment Failures
```bash
# Check deployment status
gcloud run services describe decoopa --region=europe-west3

# View recent revisions
gcloud run revisions list --service=decoopa --region=europe-west3
```

#### 3. Runtime Errors
```bash
# View application logs
gcloud logs read --service=decoopa --region=europe-west3 --limit=100

# Filter for errors
gcloud logs read --service=decoopa --region=europe-west3 --filter="severity>=ERROR"
```

### Performance Issues

#### 1. High Memory Usage
- Increase memory allocation: `--memory 2Gi`
- Check for memory leaks in the application

#### 2. Slow Response Times
- Increase CPU allocation: `--cpu 2`
- Check database connection pooling
- Monitor external API calls

#### 3. Cold Start Issues
- Set minimum instances: `--min-instances 1`
- Use CPU boost: `--cpu-boost`

## Security

### Environment Variables
- Store sensitive data in Secret Manager
- Use environment variables for non-sensitive configuration
- Rotate keys regularly

### Network Security
- Use VPC Connector for private resources
- Configure CORS properly
- Implement rate limiting

### Authentication
- Use Firebase Auth for user authentication
- Implement proper token validation
- Set up proper CORS headers

## Scaling

### Automatic Scaling
- Cloud Run automatically scales based on traffic
- Configure min/max instances as needed
- Monitor scaling metrics

### Manual Scaling
```bash
# Scale to specific number of instances
gcloud run services update decoopa \
    --region=europe-west3 \
    --min-instances 2 \
    --max-instances 10
```

## Cost Optimization

### Resource Allocation
- Start with minimal resources and scale up as needed
- Monitor usage patterns
- Use appropriate instance sizes

### Traffic Management
- Implement caching where possible
- Optimize database queries
- Use CDN for static assets

## Updates and Rollbacks

### Deploy Updates
```bash
# Deploy new version
./deploy-cloud-run.sh

# Or manually
gcloud run deploy decoopa --image [NEW_IMAGE] --region=europe-west3
```

### Rollback
```bash
# List revisions
gcloud run revisions list --service=decoopa --region=europe-west3

# Rollback to previous revision
gcloud run services update-traffic decoopa \
    --region=europe-west3 \
    --to-revisions=REVISION_NAME=100
```

## Integration

### Frontend Configuration
Update your frontend to use the new API URL:

```javascript
// In your frontend configuration
const API_URL = 'https://decoopa-xxxxx-ew.a.run.app';
```

### Domain Configuration
```bash
# Map custom domain
gcloud run domain-mappings create \
    --service decoopa \
    --domain api.decoopa.com \
    --region europe-west3
```

## Support

### Useful Commands
```bash
# Get service URL
gcloud run services describe decoopa --region=europe-west3 --format="value(status.url)"

# View service configuration
gcloud run services describe decoopa --region=europe-west3

# Update environment variables
gcloud run services update decoopa \
    --region=europe-west3 \
    --set-env-vars KEY=VALUE

# Delete service (if needed)
gcloud run services delete decoopa --region=europe-west3
```

### Documentation
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Cloud CLI](https://cloud.google.com/sdk/docs)
- [Docker Documentation](https://docs.docker.com/)
