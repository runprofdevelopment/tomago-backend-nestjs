const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ShowRoom = require('../../database/models/show-room');

module.exports = class ShowRoomRemover {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new ShowRoom();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  /**
   * Permanently delete showRoom by ID (Force delete)
   * @param {String} id ShowRoom ID (Required)
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
