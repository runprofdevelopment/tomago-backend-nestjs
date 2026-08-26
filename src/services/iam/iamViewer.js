// const { i18n } = require('../../i18n');
const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AddressViewer = require('../customer-address/addressViewer');
const User = require('../../database/models/user');

module.exports = class CustomerViewer {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    
    this.model = new User();
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }
  
  /**
   * Retrieve a Customer by ID
   * @param {String} id Customer ID (Required)
   * @returns {Promise<JSON>} Customer record
   */
  async findById(id) {
    const record = await this.repository.findDocumentById(id);
    return await this.populate(record);
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
  async listAdminsWithPagination(args) {
    args['filter'] = args.filter || [];
    args['filter'].push({ field: 'accountType', operator: 'in', values: ['owner', 'admin'] });
 
    const response = await this.repository.listCollection(args);
    // response.rows = await this.populateAll(response.rows); // Find Relations
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
  async listCustomerWithPagination(args) {
    args['filter'] = args.filter || [];
    args['filter'].push({ field: 'accountType', operator: 'equal', value: 'customer' });
 
    const response = await this.repository.listCollection(args);
    // response.rows = await this.populateAll(response.rows); // Find Relations
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
    
    // const addresses = await this.addressService.listAddresses({ orderBy: 'default', sortBy: 'desc' });

    const default_address = await new AddressViewer(this.context).findDefaultAddress();
    record['default_address'] = default_address;

    return record;
  }
};