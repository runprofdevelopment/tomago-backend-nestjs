const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AlgoliaService = require('./algoliaService');
const CategoryViewer = require('./categoryViewer');
const Category = require('../../database/models/category');

module.exports = class CategoryStatusChanger{
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Category();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
    this.categoryViewer = new CategoryViewer();
  }

  async activate(id) {
    try {
      const children = [];
      await this.categoryViewer.fetchChildren(id, children);
      const ids = children.map(category => category.id);
      ids.unshift(id);
  
      await this.#changeStatus(ids, true);

      AlgoliaService.pushTreeOfCategoriesToAlgolia();
    } catch (error) {
      throw error
    }
  }

  async deactivate(id) {
    try {
      const children = [];
      await this.categoryViewer.fetchChildren(id, children);
      const ids = children.map(category => category.id);
      ids.unshift(id);
  
      await this.#changeStatus(ids, false);

      AlgoliaService.pushTreeOfCategoriesToAlgolia();
    } catch (error) {
      throw error
    }
  }

  async #changeStatus(ids, active) {
    const data = { isActive: !!active };

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
};