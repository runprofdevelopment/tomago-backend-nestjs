const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Brand = require('../../database/models/brand');
const AlgoliaService = require('./algoliaService');

module.exports = class BrandRemover {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Brand();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  /**
   * Permanently delete brand item by ID (Force delete)
   * @param {String} id Brand ID (Required) 
   */
  async destroy(id) {
    try {
      // const record = await this.repository.findDocumentById(id);

      const batch = await FirebaseHelper.createBatch();
      await this.repository.destroyDocument(id, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await AlgoliaService.deleteBrandFromAlgolia(id);

      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }
};