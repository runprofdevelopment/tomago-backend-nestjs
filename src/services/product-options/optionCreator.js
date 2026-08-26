const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Option = require('../../database/models/product-variant-options');

module.exports = class OptionCreator {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;

    this.model = new Option();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  _preSave(data) {
    data = this.model.cast(data);

    data['id'] = HelperFunctions.stringNormalization(data.name, 'en');

    if (data && data.name) {
      data['normalize_nameEn'] = HelperFunctions.stringNormalization(data.name, 'en');
      data['normalize_nameAr'] = HelperFunctions.stringNormalization(data.name, 'ar');
    }
    return data;
  }

  async create(data) {
    try {
      data = this._preSave(data);
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });
      await FirebaseHelper.commitBatch(batch);
      return record;
    } catch (error) {
      throw error;
    }
  }
};