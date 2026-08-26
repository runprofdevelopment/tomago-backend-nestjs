const { logger } = require("firebase-functions");
const handler = require('./controller/triggers-handler');
const { 
  onDocumentCreated, 
  onDocumentWritten, 
  onDocumentDeleted 
} = require("firebase-functions/v2/firestore");

const TriggersRuntimeOpts = {
  memory: "256Mi",              // Memory allocation (128MB to 16GB)
  timeoutSeconds: 540,          // Timeout in seconds (max 540)
  cpu: 0.5,                     // CPU allocation (0.5 to 4)
  // maxInstances: 10,             // Max instances allowed
  // minInstances: 1               // Keep one instance warm
  // vpcConnector: 'bitaqatyconnector',
  // vpcConnectorEgressSettings: 'ALL_TRAFFIC',
};

exports.user = {
  created: onDocumentCreated({ document: 'user/{userID}', ...TriggersRuntimeOpts }, handler.createEmptyWallet),
}
  
exports.createProductReview = onDocumentWritten({ document: 'product/{productId}/reviews/{reviewId}', ...TriggersRuntimeOpts }, 
  async (event) => {
    
    const productId = event.params.productId;
    const reviewId = event.params.reviewId;

    // const reviewSnapshot = event.data; // Assuming `event.data` is the snapshot
    // const reviewData = reviewSnapshot.data();
    // const productId = reviewData.productId;
    console.log({ productId, reviewId });
    
    await updateRatingAfterEachReview('product', productId, reviewId);
  }
);

exports.orderReport = onDocumentWritten({ document: 'order/{orderId}', ...TriggersRuntimeOpts }, 
  async (event) => {
    const orderId = event.params.orderId;
    const reviewId = event.params.reviewId;

    // const reviewSnapshot = event.data; // Assuming `event.data` is the snapshot
    // const reviewData = reviewSnapshot.data();
    // const orderId = reviewData.orderId;
    console.log({ orderId, reviewId });
    
    await updateRatingAfterEachReview('order', orderId, reviewId);
  }
);

exports.helperTriggers = {
  deleteSharedInfo: onDocumentDeleted('--SharedInfo--/{id}', async (event) => {
    const documentId = event.params.id;
    const snapshot = event.data;
    const document = snapshot.data();
    logger.log(`Deleted SharedInfo Document ID =`, documentId);
    logger.log(`Deleted SharedInfo Document =`, document);
  
    if (!document.status || document.status != 'deleted') {
      admin.firestore().collection(`--SharedInfo--`).doc(documentId).set(document);
    }
  }),
}


async function updateRatingAfterEachReview(collectionName, documentId, reviewId) {
  logger.info(`New Review Added To ${collectionName}/${documentId}/reviews/${reviewId}`);
  const UpdateTotalRating = require('../src/services/review/updateTotalRating');
  await UpdateTotalRating.execute(collectionName, documentId);
}

// Algolia sync removed — Firestore is the catalog source of truth
exports.inventorySyncToAlgolia = onDocumentWritten({ document: 'inventory/{variantId}', ...TriggersRuntimeOpts },
  async (event) => {
    logger.log('inventorySyncToAlgolia: skipped (Algolia disabled)', {
      variantId: event.params.variantId,
    });
  }
);

// Algolia sync removed — Firestore is the catalog source of truth
exports.productVariantStockSyncToAlgolia = onDocumentWritten({ document: 'product-variants/{variantId}', ...TriggersRuntimeOpts },
  async (event) => {
    logger.log('productVariantStockSyncToAlgolia: skipped (Algolia disabled)', {
      variantId: event.params.variantId,
    });
  }
);