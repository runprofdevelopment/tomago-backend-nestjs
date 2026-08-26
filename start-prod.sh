#!/bin/bash

# Export environment variables
export NODE_ENV=production
export ALGOLIA_APPLICATION_ID=YXJAJXC0PG
export ALGOLIA_ADMIN_API_KEY=3a91e1d0eb2d1070d979966c35f78ca6
export ALGOLIA_SEARCH_ONLY_API_KEY=77a2772a07925a44b550e35694fdfaae
export PRODUCTS_INDEX=PRODUCTS
export CATEGORIES_INDEX=CATEGORIES

# Print environment variables for debugging
echo "Starting application with the following environment variables:"
echo "NODE_ENV=$NODE_ENV"
echo "ALGOLIA_APPLICATION_ID=$ALGOLIA_APPLICATION_ID"
echo "ALGOLIA_ADMIN_API_KEY=***${ALGOLIA_ADMIN_API_KEY: -4}"
echo "ALGOLIA_SEARCH_ONLY_API_KEY=***${ALGOLIA_SEARCH_ONLY_API_KEY: -4}"
echo "PRODUCTS_INDEX=$PRODUCTS_INDEX"
echo "CATEGORIES_INDEX=$CATEGORIES_INDEX"

# Start the application
node server.js
