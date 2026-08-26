const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const SettingsCreator = require('./settingsCreator');
// const Settings = require('../../database/models/settings');
const { DEFAULT_ID, COLLECTION_NAME } = require('./defaultSettings');

module.exports = class SettingsEditor {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(COLLECTION_NAME);
  }

  async save(data) {
    // data = this.model.cast(data);
    
    // Current settings
    // let currentSettings = { ...defaultSettings };
    // const currentSettings = { ...currentSettings, ...newSettings };

    try {
      this._preSave(data);

      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(DEFAULT_ID, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });
      await FirebaseHelper.commitBatch(batch);
      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      const record = await SettingsCreator.createDefault(data, this.context);
      return record;
      // throw error;
    }
  }

  _preSave(data) {
    if (data.vat > 1) {
      data.vat = data.vat / 100;
    }

    // data.vat > 1 && data.vat <=100
    return data;
  }
};