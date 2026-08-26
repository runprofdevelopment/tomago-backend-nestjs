const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Review = new (require('../../database/models/review'));

module.exports = class ReviewDestroyer {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(Review.collectionName);
  }

  /**
   * Permanently delete review item by ID (Force delete)
   * @param {String} id Review ID (Required) 
   */
  async destroy(productId, reviewId) {
    try {
      const batch = await FirebaseHelper.createBatch();
      await this.repository.destroyDocument(reviewId, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
        collectionPath: `product/${productId}/${Review.collectionName}`,
      });
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }
};