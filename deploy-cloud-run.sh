#!/bin/bash

# Cloud Run Deployment Script for Decoopa Backend
# This script deploys the backend to Google Cloud Run with improved error handling

set -e  # Exit on any error

echo "🚀 Starting Cloud Run Deployment..."

# Configuration
PROJECT_ID="decoopa-50ce2"
SERVICE_NAME="decoopa"
REGION="europe-west3"
REPOSITORY="decoopa-docker-repo"
IMAGE_NAME="europe-west3-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists gcloud; then
    print_error "gcloud CLI is not installed. Please install it first."
    print_error "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command_exists docker; then
    print_error "Docker is not installed. Please install it first."
    print_error "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_error "You are not authenticated with gcloud. Please run 'gcloud auth login' first."
    exit 1
fi

print_status "Setting up project configuration..."

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
print_status "Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Configure Docker to use gcloud as a credential helper
print_status "Configuring Docker authentication..."
gcloud auth configure-docker europe-west3-docker.pkg.dev

# Build and push the Docker image
print_status "Building and pushing Docker image..."
print_status "This may take several minutes..."

# Build the image
gcloud builds submit --tag $IMAGE_NAME . --timeout=1800s

if [ $? -eq 0 ]; then
    print_success "Docker image built and pushed successfully!"
else
    print_error "Failed to build and push Docker image"
    exit 1
fi

# Deploy to Cloud Run
print_status "Deploying to Cloud Run..."
print_status "This may take a few minutes..."

# Environment variables
ENV_VARS="NODE_ENV=production,\
ENV=production,\
ALGOLIA_APPLICATION_ID=YXJAJXC0PG,\
ALGOLIA_SEARCH_ONLY_API_KEY=77a2772a07925a44b550e35694fdfaae,\
ALGOLIA_ADMIN_API_KEY=3a91e1d0eb2d1070d979966c35f78ca6,\
ALGOLIA_WRITE_API_KEY=aa7d3437c140bd71142d1056ee82374c,\
ALGOLIA_USAGE_API_KEY=2f8f7e1ade32878819760341ce28621b,\
ALGOLIA_MONITORING_API_KEY=44ab5a3748d83d0e472bb4070b6790c7,\
BRANDS_INDEX=BRANDS,\
CATEGORIES_INDEX=CATEGORIES,\
PRODUCTS_INDEX=PRODUCTS,\
SLIDERS_INDEX=SLIDERS,\
KASHIER_BASE_URL=https://api.kashier.io,\
KASHIER_API_KEY=b059a9e7-7d49-447a-a900-58dbfe00ad9b,\
KASHIER_MID=MID-12433-396,\
KASHIER_MERCHANT_ID=MID-12433-396,\
KASHIER_SECRET_KEY=4891072efbe75c3e69eb9b3deb9b0f39\$afb2ebd8dcfd025559945f85a0fa1e976c284f72c76ee4dd4cc98da570354fde034099c90bf43ee8fda0ba7808e39428,\
WALLET_BALANCE_KEY=JaQqWoh88onGaq+m5AfUu9TtddQULIYz,\
MYLERZ_USERNAME=decoopa,\
MYLERZ_PASSWORD=Decoopa@2020"

# Deploy the service
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars $ENV_VARS \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 5 \
    --timeout 300 \
    --concurrency 80 \
    --execution-environment gen2 \
    --cpu-boost \
    --port 8080

if [ $? -eq 0 ]; then
    print_success "Cloud Run deployment completed successfully!"
else
    print_error "Failed to deploy to Cloud Run"
    exit 1
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

print_success "Service URL: $SERVICE_URL"

# Test the health endpoint
print_status "Testing health endpoint..."
print_status "Waiting for service to be ready..."

# Wait for service to be ready
sleep 30

# Test health endpoint
if curl -f "$SERVICE_URL/health" > /dev/null 2>&1; then
    print_success "Health check passed!"
else
    print_warning "Health check failed. The service might still be starting up."
    print_status "You can manually test the health endpoint at: $SERVICE_URL/health"
fi

# Test basic endpoint
print_status "Testing basic endpoint..."
if curl -f "$SERVICE_URL/" > /dev/null 2>&1; then
    print_success "Basic endpoint test passed!"
else
    print_warning "Basic endpoint test failed."
fi

echo ""
print_success "🎉 Cloud Run Deployment Complete!"
echo ""
echo "Service Details:"
echo "  - Name: $SERVICE_NAME"
echo "  - URL: $SERVICE_URL"
echo "  - Region: $REGION"
echo "  - Project: $PROJECT_ID"
echo ""
echo "Endpoints:"
echo "  - Health Check: $SERVICE_URL/health"
echo "  - API Base: $SERVICE_URL/"
echo ""
echo "Next steps:"
echo "  1. Update your frontend configuration to use the new API URL"
echo "  2. Test the API endpoints"
echo "  3. Monitor the service in Google Cloud Console"
echo "  4. Set up monitoring and logging"
echo ""
echo "To view logs:"
echo "  gcloud logs tail --service=$SERVICE_NAME --region=$REGION"
echo ""
echo "To update the service:"
echo "  ./deploy-cloud-run.sh"
