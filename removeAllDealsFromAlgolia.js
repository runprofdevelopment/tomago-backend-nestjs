#!/usr/bin/env node

/**
 * Script to remove all deal flags from products in Algolia
 * This will set inDeal: false, dealId: null, and onSale: false for all products
 */

const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');

// Initialize Firebase Admin
const serviceAccount = require('./service-accounts/production.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialize Algolia
const ALGOLIA_APPLICATION_ID = process.env.ALGOLIA_APPLICATION_ID || 'YXJAJXC0PG';
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY || '3a91e1d0eb2d1070d979966c35f78ca6';
const PRODUCTS_INDEX = process.env.PRODUCTS_INDEX || 'PRODUCTS';

const client = algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_ADMIN_API_KEY);
const index = client.initIndex(PRODUCTS_INDEX);

async function removeAllDealsFromAlgolia() {
  try {
    console.log('🔄 Starting to remove all deal flags from Algolia...\n');
    console.log(`📊 Algolia Config:`, {
      applicationId: ALGOLIA_APPLICATION_ID,
      index: PRODUCTS_INDEX
    });

    let totalUpdated = 0;
    let page = 0;
    const hitsPerPage = 100;
    let hasMore = true;

    while (hasMore) {
      console.log(`\n📄 Processing page ${page + 1}...`);
      
      // Search for products with inDeal: true
      const result = await index.search('', {
        filters: 'inDeal:true',
        hitsPerPage: hitsPerPage,
        page: page
      });

      const hits = result.hits || [];
      console.log(`📦 Found ${hits.length} products with deals on this page`);

      if (hits.length === 0) {
        hasMore = false;
        break;
      }

      // Prepare updates for batch processing
      const updates = hits.map(hit => ({
        objectID: hit.objectID,
        inDeal: false,
        dealId: null,
        onSale: false,
        // Also clear deal-related fields
        dealName: null,
        discountType: null,
        discountAmount: null,
        ribbonName: null,
        ribbonColor: null,
        ribbonBackground: null,
        dealStatus: null,
        startDate: null,
        endDate: null
      }));

      // Update in batches (Algolia supports up to 1000 objects per batch)
      const batchSize = 100;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        console.log(`  🔄 Updating batch ${Math.floor(i / batchSize) + 1} (${batch.length} products)...`);
        
        try {
          await index.partialUpdateObjects(batch, {
            createIfNotExists: false
          });
          totalUpdated += batch.length;
          console.log(`  ✅ Batch updated successfully`);
        } catch (batchError) {
          console.error(`  ❌ Error updating batch:`, batchError.message);
          // Continue with next batch
        }
      }

      // Check if there are more pages
      if (hits.length < hitsPerPage || page >= result.nbPages - 1) {
        hasMore = false;
      } else {
        page++;
      }
    }

    console.log(`\n🎉 Process completed!`);
    console.log(`📊 Total products updated: ${totalUpdated}`);
    console.log(`✅ All deal flags removed from Algolia`);

  } catch (error) {
    console.error('❌ Error removing deals from Algolia:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the script
console.log('🚀 Starting script to remove all deals from Algolia...\n');
removeAllDealsFromAlgolia();

