const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Review = new (require('../../database/models/review'));

module.exports = class ReviewEditor {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(Review.collectionName);
  }

  async update(productId, reviewId, data) {
    try {
      const review = await FirebaseHelper.findDocument(`product/${productId}/${Review.collectionName}`, reviewId);
      if (!review) {
        throw new Error(`The review doesn't exist`);
      }

      data = this._preSave(data);

      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(reviewId, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
        collectionPath: `product/${productId}/${Review.collectionName}`,
      });
      await FirebaseHelper.commitBatch(batch);

      return FirebaseHelper.findDocument(
        `product/${productId}/${Review.collectionName}`, 
        reviewId
      );
    } catch (error) {
      throw error;
    }
  }

  _preSave(data) {
    const model = Review.cast(data);
    Object.keys(model).forEach(key => {
      if (!(key in data)) delete model[key];
    });
    data = model;

    if (data && data.title) {
      data['normalize_title'] = HelperFunctions.stringNormalization(data.title)
    }
    if (data && data.body) {
      data['normalize_body'] = HelperFunctions.stringNormalization(data.body)
    }

    return data;
  }
};