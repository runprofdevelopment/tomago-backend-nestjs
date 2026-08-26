const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Brand = require('../../database/models/brand');
const AlgoliaService = require('./algoliaService');

module.exports = class BrandCreator {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Brand();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  _preSave(data) {
    data = this.model.cast(data);

    if (data && data.name) {
      data['normalize_nameEn'] = HelperFunctions.stringNormalization(data.name, 'en');
      data['normalize_nameAr'] = HelperFunctions.stringNormalization(data.name, 'ar');
    }
    // if (data && data.nameEn) {
    //   data['normalize_nameEn'] = HelperFunctions.stringNormalization(data.nameEn, 'en');
    // }
    // if (data && data.nameAr) {
    //   data['normalize_nameAr'] = HelperFunctions.stringNormalization(data.nameAr, 'ar');
    // }

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

      const algoliaInput = await this.repository.findDocumentById(record.id);
      await AlgoliaService.addBrandToAlgolia({
        nameEn: algoliaInput.name.en,
        nameAr: algoliaInput.name.ar,
        ...algoliaInput
      });
      return algoliaInput;
    } catch (error) {
      throw error;
    }
  }
};