const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const AlgoliaService = require('./algoliaService');
const Category = require('../../database/models/category');

module.exports = class CategoryCreator {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Category();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async _preSave(data, action) {
    if (action == 'createCategory') {
      const position = await this.getNewPosition();
      data = {
        ...this.model.cast(data),
        id: await FirebaseHelper.newIndex(this.collectionName, true),
        parent_id: 0,
        level: 1,
        position: position,
        // position: position + 1,
      }
    } else if (action == 'createSubcategory') {
      data = {
        id: await FirebaseHelper.newIndex(this.collectionName, true),
        ...this.model.cast(data),
      }
    } 

    // if (data && data.name) {
    //   data['normalize_name'] = {
    //     en: HelperFunctions.stringNormalization(data.name, 'en'),
    //     ar: HelperFunctions.stringNormalization(data.name, 'ar'),
    //   }
    // }
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
      data = await this._preSave(data, 'createCategory');
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch: batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      AlgoliaService.pushTreeOfCategoriesToAlgolia();

      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }

  async createSubcategory(data) {
    try {
      data = await this._preSave(data, 'createSubcategory');
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch: batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      AlgoliaService.pushTreeOfCategoriesToAlgolia();

      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }

  async getNewPosition() {
    // const position = (await admin.firestore().collection(this.collectionName).where('parent_id', '==', 0).get()).size
    const db = admin.firestore();
    const snapshot = await db.collection(this.collectionName).where('parent_id', '==', 0).count().get();
    const lastPosition = snapshot.data().count;
    console.log(lastPosition);

    return lastPosition + 1;
  }
};