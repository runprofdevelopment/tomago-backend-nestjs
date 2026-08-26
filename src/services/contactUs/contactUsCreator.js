const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const ContactUs = require('../../database/models/contactUs');

module.exports = class ContactUsCreator {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;

    this.model = new ContactUs();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  _preSave(data) {
    data = this.model.cast(data);

    if (data.firstName || data.lastName) {
      data.fullName = `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim();
    }
    
    if (data && data.firstName) {
      data['normalize_firstName'] = HelperFunctions.stringNormalization(data.firstName);
    }
    if (data && data.lastName) {
      data['normalize_lastName'] = HelperFunctions.stringNormalization(data.lastName);
    }
    if (data && data.fullName) {
      data['normalize_fullName'] = HelperFunctions.stringNormalization(data.fullName);
    }
    return data;
  }

  async create(data) {
    try {
      data = this._preSave(data);
      const batch = await FirebaseHelper.createBatch();
      await this.repository.createDocument(data, {
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