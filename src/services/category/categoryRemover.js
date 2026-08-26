const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AlgoliaService = require('./algoliaService');
const CategoryViewer = require('./categoryViewer');
const Category = require('../../database/models/category');

module.exports = class CategoryRemover {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;

    this.model = new Category();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
    this.categoryViewer = new CategoryViewer();
  }

  async markAsDeleted(id) {
    try {
      const children = [];
      await this.categoryViewer.fetchChildren(id, children);
      const ids = children.map(category => category.id);
      ids.unshift(id);

      await this.flagDocumentsAsDeleted(ids);

      AlgoliaService.pushTreeOfCategoriesToAlgolia();
    } catch (error) {
      throw error;
    }
  }

  async flagDocumentsAsDeleted(ids) {
    const data = { isRemoved: true };

    const batch = await FirebaseHelper.createBatch();
    await Promise.allSettled(
      ids.map(id => this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      }))
    );
    await FirebaseHelper.commitBatch(batch);
  }

  /**
   * Permanently delete the item (Delete immediately)
   * @param {*} id 
   */
  async deletePermanently(id) {
    try {
      const children = [];
      await this.categoryViewer.fetchChildren(id, children);
      const ids = children.map(category => category.id);
      ids.unshift(id);

      await this.#destroyAll(ids);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Permanently delete the category item by ID (Delete immediately)
   * @param {String} id Category ID (Required) 
   */
  async #destroy(id) {
    try {
      const batch = await FirebaseHelper.createBatch();
      await this.repository.destroyDocument(id, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);

      AlgoliaService.pushTreeOfCategoriesToAlgolia();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Permanently delete the categories items by Ids (Delete immediately)
   * @param {String[]} ids categories Ids (Required) 
   */
  async #destroyAll(ids) {
    try {
      const maximumWritesPerBatch = 500;
      const numOfRequests = Math.ceil(ids.length / maximumWritesPerBatch);

      for (let index = 0; index < numOfRequests; index++) {
        const Start = maximumWritesPerBatch * index;
        const End = maximumWritesPerBatch * (index + 1);
        const Chunks = ids.slice(Start, End);
        
        const batch = await FirebaseHelper.createBatch();
        await Promise.allSettled(
          Chunks.map((id) => this.repository.destroyDocument(id, {
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
};