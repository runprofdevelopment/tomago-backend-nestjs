const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ContactUs = require('../../database/models/contactUs');

module.exports = class ContactUsRemover {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new ContactUs();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  /**
   * Permanently delete contactUs item by ID (Force delete)
   * @param {String} id ContactUs ID (Required) 
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
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }
};