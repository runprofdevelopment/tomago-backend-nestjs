const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Project = require('../../database/models/project');

module.exports = class ProjectRemover {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Project();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  /**
   * Permanently delete project by ID (Force delete)
   * @param {String} id Project ID (Required)
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
