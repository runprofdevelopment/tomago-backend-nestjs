// const { i18n } = require('../../i18n');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Notification = require('../../database/models/notification');

module.exports = class NotificationRemover {
  constructor(context) {
    this.language = (context && context.language) || null;
    this.currentUser = context && context.currentUser || null;
    this.model = new Notification();
    this.collectionPath = `user/${this.currentUser.id}/${this.model.collectionName}`;
    this.repository = new FirestoreRepository(this.collectionPath);
  }

  /**
   * Permanently delete notification item by ID (Force delete)
   * - Delete the notification from the firestore collection
   * @param {String} id Notification ID (Required) 
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

  /**
   * Delete the notifications from the firestore collection
   * @param {String[]} ids Notification Ids (Required) 
   */
  async destroyAll(userId, ids) {
    try {
      const maximumWritesPerBatch = 500
      const numOfRequests = Math.ceil(ids.length / maximumWritesPerBatch)

      for (let index = 0; index < numOfRequests; index++) {
        const Start = maximumWritesPerBatch * index
        const End = maximumWritesPerBatch * (index + 1)
        const Chunks = ids.slice(Start, End);
        
        const batch = await FirebaseHelper.createBatch();
        await Promise.allSettled(
          Chunks.map((id) => this.repository.destroyDocument(id, {
            batch,
            currentUser: this.currentUser,
            language: this.language,
            collectionPath: `user/${userId}/${this.model.collectionName}`,
          }))
        );
        await FirebaseHelper.commitBatch(batch);
      }
    } catch (error) {
      throw error;
    }
  }
};