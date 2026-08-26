const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
// const InventoryViewer = require('../inventory/inventoryViewer');
const Review = new (require('../../database/models/review'));

module.exports = class ReviewViewer {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(Review.collectionName);
  }

  /**
   * Retrieve a inventory by ID
   * @param {String} id Inventory ID (Required)
   * @returns {Promise<JSON>} Inventory record
   */
  async findReviewById(productId, reviewId) {
    // const record = await this.repository.findDocumentById(id);
    const collectionPath = `product/${productId}/${Review.collectionName}`;
    const record = await FirebaseHelper.findDocument(collectionPath, reviewId);
    return await this.populate(record);
  }

  async findProductReviews({ productId, filter, orderBy, sortBy }) {
    // const record = await this.repository.findDocumentById(id);
    const collectionPath = `product/${productId}/${Review.collectionName}`;
    const records = await FirebaseHelper.listCollection(collectionPath, filter, orderBy, sortBy);
    return await this.populateAll(records);
  }

  async listCustomerReviews(args) {
    if (!args.customerId) throw new Error('customerId is required');

    args['filter'] = args.filter || [];
    args['filter'].push({ field: 'createdBy', operator: 'equal', value: args.customerId });

    const response = await new FirestoreRepository().listCollectionGroup(Review.collectionName, args);
    response.rows = await this.populateAll(response.rows); // Find Relations
    return response;
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
    const response = await new FirestoreRepository().listCollectionGroup(Review.collectionName, args);
    response.rows = await this.populateAll(response.rows); // Find Relations
    return response;
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

    const User = await FirebaseHelper.findRelation('user', record.createdBy); 
    record['reviewer'] = {
      name: (User && User.fullName) || record.userName,
      email: (User && User.email) || record.email,
      avatar: (User && User.email) || null,
    }

    // new InventoryViewer(this.ctx).findById();
    const Product = await FirebaseHelper.findRelation('product', record.productId); 
    record['product'] = Product;
    
    return record;
  }

  /**
   * Lists the reviews autocomplete.
   * - See https://mongoosejs.com/docs/queries.html to learn how to customize the query.
   * @param {String} fieldName 
   * @param {String} search 
   * @param {Number} limit Limit of 
   * @param {'en'|'ar'} lang Language code like en, ar, ... 
   * @returns 
   */
  async findAutocomplete(fieldName, search, limit, lang) {
    const language = lang
    const collectionPath = this.collectionPath
    return FirebaseHelper.findAutocomplete(collectionPath, fieldName, search, limit, language);
  }
};