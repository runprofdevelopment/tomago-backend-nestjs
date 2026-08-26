// const { i18n } = require('../../i18n');
const lodash = require('lodash');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Notification = require('../../database/models/notification');

module.exports = class NotificationEditor {
  constructor(context) {
    this.language = (context && context.language) || null;
    this.currentUser = context && context.currentUser || null;
    this.model = new Notification();
    this.collectionPath = `user/${this.currentUser.id}/${this.model.collectionName}`;
    this.repository = new FirestoreRepository(this.collectionPath);
  }

  async markAsRead(id) {
    try {
      // check this notification is read or not 
      const notification = await FirebaseHelper.findDocument(this.collectionPath, id);
      if (notification && notification.isRead) return;

      const batch = await FirebaseHelper.createBatch();
      const data = { isRead: true }
      await this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });

      await FirebaseHelper.decrementCounter(this.collectionPath, 'unread-messages', batch);
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error
    }
  }
};