const { logger } = require("firebase-functions");
const handler = require('./controller/triggers-handler');
const notificationHandler = require('./controller/notification-triggers-handler');
const { 
  onDocumentCreated, 
  onDocumentWritten, 
  onDocumentDeleted 
} = require("firebase-functions/v2/firestore");

// Firestore Enterprise DB id is `default` (not the classic `(default)`).
const TriggersRuntimeOpts = {
  database: 'default',
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

    console.log({ productId, reviewId });
    
    await updateRatingAfterEachReview('product', productId, reviewId);
  }
);

// ---- Domain notification triggers ----

exports.orderNotifications = onDocumentWritten(
  { document: 'order/{orderId}', ...TriggersRuntimeOpts },
  notificationHandler.handleOrderNotification,
);

exports.returnNotifications = onDocumentWritten(
  { document: 'returnRequest/{returnId}', ...TriggersRuntimeOpts },
  notificationHandler.handleReturnNotification,
);

exports.withdrawalNotifications = onDocumentWritten(
  { document: 'withdrawalRequest/{withdrawalId}', ...TriggersRuntimeOpts },
  notificationHandler.handleWithdrawalNotification,
);

exports.walletCreditNotifications = onDocumentWritten(
  { document: 'wallet/{walletId}', ...TriggersRuntimeOpts },
  notificationHandler.handleWalletCreditNotification,
);

exports.customRequestNotifications = onDocumentWritten(
  { document: 'customRequest/{requestId}', ...TriggersRuntimeOpts },
  notificationHandler.handleCustomRequestNotification,
);

exports.helperTriggers = {
  deleteSharedInfo: onDocumentDeleted({ document: '--SharedInfo--/{id}', database: 'default' }, async (event) => {
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
