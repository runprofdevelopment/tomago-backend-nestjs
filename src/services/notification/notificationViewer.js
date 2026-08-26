// const { i18n } = require('../../i18n');
const lodash = require('lodash');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Notification = require('../../database/models/notification');

module.exports = class NotificationViewer {
  constructor(context) {
    this.language = (context && context.language) || null;
    this.currentUser =
      (context && context.currentUser) || null;
    this.model = new Notification();
    this.collectionPath = `user/${this.currentUser.id}/${this.model.collectionName}`;
    this.repository = new FirestoreRepository(
      this.collectionPath,
    );
  }

  async findUnreadNotificationsCount(userId) {
    if (!userId) return 0;

    const collectionPath = `user/${userId}/${
      new Notification().collectionName
    }`;
    const count = await FirebaseHelper.getCounter(
      collectionPath,
      'unread-messages',
    );
    console.log('Count =', count);
    return count ? count : 0;
  }

  /**
   * Retrieve a Customer by ID
   * @param {String} id Customer ID (Required)
   * @returns {Promise<JSON>} Customer record
   */
  async findById(id) {
    const record = await this.repository.findDocumentById(
      id,
    );
    // return await this.populate(record);
    return record;
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
    const response = await this.repository.listCollection(
      args,
    );
    // response.rows = await this.populateAll(response.rows); // Find Relations
    return response;
  }

  /**
   * Populates the records with all its relations.
   * @param {JSON[]} records
   */
  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record)),
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
    return record;
  }
};
