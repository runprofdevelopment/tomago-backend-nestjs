const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
// const HelperFunctions = require('../../utils/helperFunctions');
// const AlgoliaService = require('../../infrastructure/algolia/algoliaSearch');
const Category = require('../../database/models/category');

module.exports = class CategoryViewer {
  constructor() {
    this.model = new Category();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }
  
  /**
   * Retrieve a category by ID
   * @param {String} id Category ID (Required)
   * @param {Boolean} [withChildren] If true, the children will be retrieved also.
   * @returns {Promise<JSON>} Category record
   */
  async findById(id, withChildren = false) {
    const record = await this.repository.findDocumentById(id);
    const root = await this.populate(record);
    
    if (withChildren) {
      await this.fetchTree(root);
    }

    return root;
  }

  /**
   * @param {Object} args 
   * @param {JSON} args.filter 
   * @param {String} args.orderBy 
   * @param {Object} args.pagination
   * @param {Number} args.pagination.page
   * @param {Number} args.pagination.offset
   * @param {JSON} args.pagination.doc
   * @param {Number} args.pagination.limit
   * @param {'asc'|'desc'} args.pagination.sortBy
   * @param {'current'|'next'|'prev'} args.pagination.action
   * @returns {Promise}
   */
  async listWithPagination(args) {
    args['filter'] = args.filter || [];
    const response = await this.repository.listCollection(args);
    response.rows = await this.populateAll(response.rows); // Find Relations
    return response
  }

  /**
   * Populates the records with all its relations.
   * @param {JSON[]} records
   */
  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record))
    );
  }

  /**
   * Populates the record with all its relations.
   * @param {JSON} record
   */
  async populate(record) {
    if (!record) {
      return record;
    }

    const parents = await this.fetchAllParentsOfChild(record.id);
    const pathEn = parents.map(parent => parent.name.en).join(' > ');
    const pathAr = parents.map(parent => parent.name.ar).join(' > ');
    record['path'] = {
      en: pathEn,
      ar: pathAr,
    }

    return record;
  }


  async fetchAllParentsOfChild(parentId, listOfParent = []) {
    if (parentId == 0) return listOfParent;

    const node = await FirebaseHelper.findDocument(this.collectionName, parentId);

    if (node) {
      await this.fetchAllParentsOfChild(node.parent_id, listOfParent);
      listOfParent.push(node);
    }
    
    return listOfParent;
  }

  async fetchChildren(parentId, children = []) {
    const nodes = FirebaseHelper.filterSoftDeletedRecords(
      FirebaseHelper.mapCollection(
        await admin.firestore().collection(this.collectionName).where('parent_id', '==', parentId).get()
      )
    )

    if (nodes.length === 0) return [];

    children.push(...nodes)
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      await this.fetchChildren(node.id, children)
    }
    return children;
  }

  async fetchTree(root, listOfNodes) {
    const children = listOfNodes && listOfNodes.length 
      ? listOfNodes.filter(child => child.parent_id === root.id)
      : FirebaseHelper.filterSoftDeletedRecords(
        FirebaseHelper.mapCollection(
          await admin.firestore().collection(this.collectionName).where('parent_id', '==', root.id).orderBy('position', 'asc').get()
        )
      );

    root['children'] = children;

    if (children.length === 0) return

    // for (let index = 0; index < children.length; index++) {
    //   const node = children[index];
    //   await this.fetchTree(node)
    // }
    await Promise.all(
      children.map(child => this.fetchTree(child, listOfNodes))
    )

    return root
  }

  async retrievingCategoriesTree() {
    try {
      const categories = FirebaseHelper.mapCollection(
        await admin.firestore().collection(this.collectionName)
          .where('deletedAt', '==', null).orderBy('position', 'asc').get()
      )

      const roots = categories.filter(category => category.parent_id === 0)
      await Promise.all(
        roots.map(root => this.fetchTree(root, categories))
      )
      // for (let index = 0; index < roots.length; index++) {
      //   const root = roots[index];
      //   await this.fetchTree(root, categories)
      // }

      return roots
    } catch (error) {
      throw error
    }
  }
};