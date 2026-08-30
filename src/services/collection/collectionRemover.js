const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Collection = require('../../database/models/collection');

module.exports = class CollectionRemover {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Collection();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  /**
   * Permanently delete collection by ID (Force delete)
   * @param {String} id Collection ID (Required)
   */
  async destroy(id) {
    try {
      const batch = await FirebaseHelper.createBatch();
      await this.repository.destroyDocument(id, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }
};
