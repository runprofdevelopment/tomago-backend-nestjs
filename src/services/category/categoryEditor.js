const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const AlgoliaService = require('./algoliaService');
const Category = require('../../database/models/category');

module.exports = class CategoryEditor {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;

    this.model = new Category();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  _preSave(data) {
    const model = this.model.cast(data);
    Object.keys(model).forEach(key => {
      if (!(key in data)) delete model[key];
    });
    data = model;

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

  /**
   * Edit an existing category
   * @param {String} id Category ID (Required)
   * @param {JSON} data Category data that you want to update
   * @returns {Promise<JSON>} Category record
   */
  async update(id, data) {
    try {
      data = this._preSave(data);
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });

      // if (data && data.name) {
      //   const ProductService = require('./productService');
      //   await new ProductService({
      //     currentUser: this.currentUser,
      //     language: this.language,
      //   }).refreshRelations('categoryId', id, { category: record.name });
      // }

      await FirebaseHelper.commitBatch(batch);

      AlgoliaService.pushTreeOfCategoriesToAlgolia();

      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }

  async updateMany(ids, data) {
    try {
      const maximumWritesPerBatch = 500
      const numOfRequests = Math.ceil(ids.length / maximumWritesPerBatch)

      for (let index = 0; index < numOfRequests; index++) {
        const Start = maximumWritesPerBatch * index
        const End = maximumWritesPerBatch * (index + 1)
        const Chunks = ids.slice(Start, End);
        
        const batch = await FirebaseHelper.createBatch();
        await Promise.allSettled(
          Chunks.map(id => this.repository.updateDocument(id, data, {
            batch,
            currentUser: this.currentUser,
            language: this.language,
          }))
        );
        await FirebaseHelper.commitBatch(batch);
      }

      AlgoliaService.pushTreeOfCategoriesToAlgolia();
    } catch (error) {
      throw error;
    }
  }

  async moveCategory(id, parentId, position) {
    try {
      const collectionRef = admin.firestore().collection(this.collectionName);

      // [1] Get parent node 
      // const parent = await this.findById(parentId);
      const parent = await this.repository.findDocumentById(parentId);
            
      // [2] Get all siblings of this node
      const siblings = FirebaseHelper.mapCollection(
        await collectionRef.where('parent_id', '==', parentId)
          .where('position', '>=', position)
          .orderBy('position', 'asc')
          .get()
      );

      // [3] Get all children of this node
      const children = FirebaseHelper.mapCollection(
        await collectionRef.where('parent_id', '==', id).get()
      );

      // [4] Update the position of all siblings after currentNode
      const sibling_ids = siblings.map(sibling => sibling.id);
      await this.updateMany(sibling_ids, { position: admin.firestore.FieldValue.increment(1) });

      // [5] Update the current changed node
      const currentNode = { 
        id,
        parent_id: parentId,
        position: (position > 0 && position) || 1,
        level: (parent && parent.level > 0 && (parent.level + 1)) || 1
      }
      await this.update(id, currentNode);

      // [6] Update the level of all children of currentNode
      const children_ids = children.map(child => child.id);
      await this.updateMany(children_ids, { level: currentNode.level + 1 });
    } catch (error) {
      throw error;
    }
  }
};