const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Collection = require('../../database/models/collection');

module.exports = class CollectionEditor {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;

    this.model = new Collection();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  _preSave(data) {
    const model = this.model.cast(data);
    Object.keys(model).forEach(key => {
      if (!(key in data)) delete model[key];
    });
    data = model;

    if (data && data.name) {
      data['normalize_nameEn'] = HelperFunctions.stringNormalization(data.name, 'en');
      data['normalize_nameAr'] = HelperFunctions.stringNormalization(data.name, 'ar');
    }

    return data;
  }

  async update(id, data) {
    try {
      data = this._preSave(data);
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);

      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }
};
