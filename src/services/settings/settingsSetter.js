const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Settings = require('../../database/models/settings');

module.exports = class SettingsSetter {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Settings();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  _preSave(data) {
    data = this.model.cast(data);

    return data;
  }

  async set(data) {
    try {
      data = this._preSave(data);
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(
        { ...data, id: 'Settings' },
        {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        },
      );
      await FirebaseHelper.commitBatch(batch);

      return record;
    } catch (error) {
      throw error;
    }
  }
};
