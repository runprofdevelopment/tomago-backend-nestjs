#!/usr/bin/env node

/**
 * Script to sync all existing deal products to Algolia
 * This ensures that products already in deals have the correct inDeal field set
 */

// Set environment variables for Algolia
process.env.ALGOLIA_APPLICATION_ID = 'YXJAJXC0PG';
process.env.ALGOLIA_ADMIN_API_KEY = '3a91e1d0eb2d1070d979966c35f78ca6';
process.env.ALGOLIA_SEARCH_ONLY_API_KEY = '77a2772a07925a44b550e35694fdfaae';
process.env.PRODUCTS_INDEX = 'PRODUCTS';

const admin = require('firebase-admin');
const AlgoliaService = require('./src/services/product/algoliaService');

// Initialize Firebase Admin
const serviceAccount = require('./service-accounts/production.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'decoopa-50ce2'
});

async function syncDealProductsToAlgolia() {
  try {
    console.log('🔄 Starting sync of deal products to Algolia...');
    
    // Get all active deals
    const dealsSnapshot = await admin.firestore()
      .collection('deal')
      .where('status', '==', 'active')
      .get();
    
    console.log(`📊 Found ${dealsSnapshot.size} active deals`);
    
    let totalProductsSynced = 0;
    
    for (const dealDoc of dealsSnapshot.docs) {
      const deal = { id: dealDoc.id, ...dealDoc.data() };
      const items = deal.items || [];
      
      console.log(`\n🎯 Processing deal: ${deal.name} (${deal.id})`);
      console.log(`   Items in deal: ${items.length}`);
      
      // Prepare deal information for Algolia
      const dealInfo = {
        dealId: deal.id,
        dealName: deal.name,
        discountType: deal.discountType,
        discountAmount: deal.discountAmount,
        currency: deal.currency,
        ribbonName: deal.ribbonName,
        ribbonColor: deal.ribbonColor,
        ribbonBackground: deal.ribbonBackground,
        dealStatus: deal.status,
        startDate: deal.startDate,
        endDate: deal.endDate,
        inDeal: true,
        onSale: true,
      };
      
      // Update each variant in Algolia
      for (const item of items) {
        try {
          await AlgoliaService.updateVariant(item.variantId, dealInfo);
          console.log(`   ✅ Synced variant: ${item.variantId}`);
          totalProductsSynced++;
        } catch (error) {
          console.error(`   ❌ Failed to sync variant ${item.variantId}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Sync completed! Total products synced: ${totalProductsSynced}`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the sync
syncDealProductsToAlgolia();
