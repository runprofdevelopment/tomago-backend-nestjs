const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AlgoliaService = require('../product/algoliaService');
const Product = new (require('../../database/models/product'));
const Variant = new (require('../../database/models/product-variant'));

module.exports = class InventoryViewer {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.productRepository = new FirestoreRepository(Product.collectionName);
    this.variantRepository = new FirestoreRepository(Variant.collectionName);
  }

  async findProductById(id) {
    // const record = await FirebaseHelper.findDocument(Product.collectionName, id);
    const record = await this.productRepository.findDocumentById(id);

    const varaints = FirebaseHelper.mapCollection(
      await admin.firestore().collection(Variant.collectionName)
        .where('product_id', '==', id).get()
    );
    record['variants'] = varaints;

    return record;
    // return await this.populate(record)
  }

  async findVariantById(id) {
    const record = await this.variantRepository.findDocumentById(id);
    return await this.populate(record);
  }

  async listArchivedProducts(args) {
    args['filter'] = args.filter || [];
    args['filter'].push({ field: 'status', operator: '==', value: 'archived' });

    // const response = await FirebaseHelper.listCollection(Variant.collectionName, args);

    const response = await this.variantRepository.listCollection(args);
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
    const hasStatusFilter = args.filter.some((f) => f.field === 'status');
    if (!hasStatusFilter) {
      args['filter'].push({
        field: 'status',
        operator: 'in',
        value: ['active', 'inactive', 'draft'],
      });
    }

    // const response = await new FirestoreRepository().listCollectionGroup('variants', args);
    const response = await this.variantRepository.listCollection(args);
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

    const variant = record;
    const product = await FirebaseHelper.findRelation('product', variant.product_id);

    delete product.id;
    delete product.createdAt;
    delete product.createdBy;
    delete product.updatedAt;
    delete product.updatedBy;

    const main_image = AlgoliaService._selectMainImageUrl(variant.variant_images);

    record = {
      ...product,
      ...variant,
      variant_id: variant.id,
      current_price: record.price,
      main_image,
    }

    const dateNow = new Date();
    const saleStartDate = record.sale_start_date || null;
    const saleEndDate = record.sale_end_date || null;

    if (record.sale_price > 0 && dateNow >= saleStartDate && dateNow <= saleEndDate) {
      record['current_price'] = record.sale_price;
      record['onSale'] = true;
      record['ribbon_name'] = 100 - (record.sale_price / record.price * 100) + '%';
      record['ribbon_color'] = '#FFFEFD';
      record['ribbon_background'] = '#EC8181';
    }

    return record;
  }

  async available(variantId) {
    const variant = await this.variantRepository.findDocumentById(variantId);

    if (!variant) {
      throw new Error(`The item: "${variantId}" doesn't exist`);
      // throw new Error(`The product is not available`);
    }

    return variant['inventory_quantity'];
  }
};