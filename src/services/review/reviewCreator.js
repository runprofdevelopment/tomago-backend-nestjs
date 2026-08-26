const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Review = new (require('../../database/models/review'));

module.exports = class ReviewCreator {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(Review.collectionName);
  }

  async create(productId, data) {
    try {
      const product = await FirebaseHelper.findDocument('product', productId);
      if (!product) {
        throw new Error(`The product doesn't exist`);
      }

      data = this._preSave({ productId, ...data });

      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
        collectionPath: `product/${productId}/${Review.collectionName}`,
      });
      await FirebaseHelper.commitBatch(batch);
      
      return FirebaseHelper.findDocument(
        `product/${productId}/${Review.collectionName}`, 
        record.id,
      );
    } catch (error) {
      throw error;
    }
  }

  
  _preSave(data) {
    data = {
      ...Review.cast(data),
      id: this.currentUser.id,
    }

    if (data && data.title) {
      data['normalize_title'] = HelperFunctions.stringNormalization(data.title)
    }
    if (data && data.body) {
      data['normalize_body'] = HelperFunctions.stringNormalization(data.body)
    }

    return data;
  }

  // async _validateEntityID() {
  //   const entity = await FirebaseHelper.findDocument(this.entityName, this.entityId)
  //   if (!entity) {
  //     throw new ErrorHandler({
  //       errorCode: 'NOT_FOUND',
  //       message: i18n(this.language, 'errors.NOT_FOUND_DOCUMENT', [this.entityId])
  //     })
  //   }
  // }
};