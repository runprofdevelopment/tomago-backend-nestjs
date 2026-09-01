const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Project = require('../../database/models/project');

module.exports = class ProjectViewer {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Project();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  /**
   * Retrieve a Project by ID
   * @param {String} id Project ID (Required)
   * @returns {Promise<JSON>} Project record
   */
  async findById(id) {
    const record = await this.repository.findDocumentById(
      id,
    );
    return await this.populate(record);
  }

  /**
   * Retrieve a Project by slug
   * @param {String} slug Project slug (Required)
   * @returns {Promise<JSON>} Project record
   */
  async findBySlug(slug) {
    const filter = [
      { field: 'slug', operator: 'equal', value: slug },
    ];
    const records = await FirebaseHelper.listCollection(
      this.collectionName,
      filter,
[{ field: 'createdAt', order: 'desc' }],
    );
    const record = records && records.length ? records[0] : null;
    return await this.populate(record);
  }

  async listActiveItems() {
    const filter = [
      { field: 'status', operator: 'equal', value: 'active' },
    ];
    const records = await FirebaseHelper.listCollection(
      this.collectionName,
      filter,
      'createdAt',
      'desc',
    );
    return await Promise.all(
      records.map((record) => this.populateActive(record)),
    );
  }

  async listFeaturedItems() {
    const filter = [
      { field: 'status', operator: 'equal', value: 'active' },
      { field: 'is_featured', operator: 'equal', value: true },
    ];
    const records = await FirebaseHelper.listCollection(
      this.collectionName,
      filter,
      'createdAt',
      'desc',
    );
    return await Promise.all(
      records.map((record) => this.populateActive(record)),
    );
  }

  async listWithPagination(args) {
    const response = await this.repository.listCollection(
      args,
    );
    response.rows = await this.populateAll(response.rows);
    return response;
  }

  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record)),
    );
  }

  async populate(record) {
    if (!record) {
      return record;
    }
    return record;
  }

  async populateActive(record) {
    if (!record) {
      return record;
    }
    return record;
  }
};
