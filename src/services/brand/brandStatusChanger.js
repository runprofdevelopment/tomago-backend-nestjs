const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Brand = require('../../database/models/brand');
const AlgoliaService = require('./algoliaService');

module.exports = class BrandStatusChanger{
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Brand();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async activate(id) {
    try {
      const data = { isActive: true };
      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });
      await FirebaseHelper.commitBatch(batch);
      await AlgoliaService.updateBrandInAlgolia(id, data);
    } catch (error) {
      throw error
    }
  }

  async deactivate(id) {
    try {
      const data = { isActive: false };
      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });
      await FirebaseHelper.commitBatch(batch);
      await AlgoliaService.updateBrandInAlgolia(id, data);
    } catch (error) {
      throw error
    }
  }
};