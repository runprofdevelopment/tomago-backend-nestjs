const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Customer = new (require('../../database/models/customer'));
const Address = new (require('../../database/models/address'));

module.exports = class AddressViewer {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.customerId = null;
  }
  
  get collectionPath() {
    const customer_id = this.customerId || this.currentUser.id;
    const collection_path = `${Customer.collectionName}/${customer_id}/${Address.collectionName}`;
    return collection_path;
  }

  async findById(customerId, id) {
    this.customerId = customerId || this.currentUser.id;
    const record = await FirebaseHelper.findDocument(this.collectionPath, id);
    return await this.populate(record);
  }

  async findDefaultAddress(customerId) {
    this.customerId = customerId || this.currentUser.id;

    const filter = [{ field: 'default', operator: 'equal', value: true }];
    const addresses = await FirebaseHelper.listCollection(this.collectionPath, filter);
    
    if (addresses.length > 0) {
      const record = addresses[0];
      return await this.populate(record);
    }
    return null;
  }

  /**
   * @param {String} customerId
   * @param {Object} args 
   * @param {JSON} args.filter 
   * @param {String} args.orderBy 
   * @param {'asc'|'desc'} args.sortBy
   * @returns {Promise<JSON[]>}
   */
  async listAddresses(customerId, { filter, sort }) {
    this.customerId = customerId || this.currentUser.id;

    const Filter = filter || [];
    const records = await FirebaseHelper.listCollection(this.collectionPath, Filter, sort);
     
    return await Promise.all(
      records.map((record) => this.populate(record))
    );
  }

  /**
   * Lists the addresss autocomplete.
   * - See https://mongoosejs.com/docs/queries.html to learn how to customize the query.
   * @param {String} fieldName 
   * @param {String} fieldName 
   * @param {String} search 
   * @param {Number} limit Limit of 
   * @param {'en'|'ar'} lang Language code like en, ar, ... 
   * @returns 
   */
  async findAutocomplete(customerId, fieldName, search, limit, language) {
    this.customerId = customerId || this.currentUser.id;
    return FirebaseHelper.findAutocomplete(this.collectionPath, fieldName, search, limit, language);
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

    record['name'] = `${(record.firstName || '').trim()} ${(record.lastName || '').trim()}`.trim();
    record['phoneVerified'] = !!record.phoneVerified
    return record;
  }
};