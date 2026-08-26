const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Variant =
  new (require('../../database/models/product-variant'))();
const Deal = require('../../database/models/deal');

const AlgoliaProductService = require('../product/algoliaService');

module.exports = class DealViewer {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.selectedFields = context?.selectedFields || [];
    this.model = new Deal();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  async findById(id) {
    const record = await this.repository.findDocumentById(
      id,
    );
    const deal = await this.populate(record);
    return deal;
  }

  async listWithPagination(args) {
    args['filter'] = args.filter || [];
    const response = await this.repository.listCollection(
      args,
    );
    // for (let deal of response.rows) {
    //   deal['userInfo'] = await UserRepository.findById(deal.userID)
    // }
    response.rows = await this.populateAll(response.rows);
    return response;
  }

  async listAll(status) {
    const selectedFields = ['id', 'name'];
    let query = admin
      .firestore()
      .collection(this.collectionName)
      .select(...selectedFields);

    if (status) {
      query = query.where('status', '==', status);
    }

    const records = FirebaseHelper.mapCollection(
      await query.get(),
    );
    return records;
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

    if (this.selectedFields.includes('items')) {
      record['items'] = await this.fetchAlgoliaProducts(
        record.items,
      );
    }
    return record;
  }

  async fetchProduct(productId, variantId) {
    return AlgoliaProductService._hydrateVariant(variantId);
  }

  async fetchAlgoliaProducts(items) {
    try {
      if (!items) return [];
      const variantIds = items.map((item) => item.variantId);
      const products =
        await AlgoliaProductService.fetchAlgoliaProducts(variantIds);

      return products.map((product) => {
        return {
          ...product,
          variant_id: product.objectID || product.variant_id,
        };
      });
    } catch (error) {
      throw new Error(
        'Cannot find product information (ProductID or VariantID may be invalid)',
      );
    }
  }

  _applyPagination(data, pagination) {
    const ACTION =
      (pagination && pagination.action) || 'current';
    const PAGE_SIZE = (pagination && pagination.limit) || 0;
    const PAGE = Math.abs(
      (pagination && pagination.page) || 1,
    );

    const TOTAL_COUNT = data.length;
    const TOTAL_PAGES = Math.ceil(TOTAL_COUNT / PAGE_SIZE);

    let start, end;
    switch (ACTION) {
      case 'next':
        start = PAGE * PAGE_SIZE;
        end = start + PAGE_SIZE;
        break;
      case 'prev':
        start = (PAGE - 2) * PAGE_SIZE;
        end = start + PAGE_SIZE;
        break;
      default:
        start = (PAGE - 1) * PAGE_SIZE;
        end = start + PAGE_SIZE;
        break;
    }

    const rows = data.slice(start, end);
    return {
      count: TOTAL_COUNT,
      rows,
      // rows: await this.populateAll(rows), // Find Relations
      pagination: {
        totalCount: TOTAL_COUNT,
        pageSize: PAGE_SIZE,
        pagesNumber: TOTAL_PAGES,
        isFirstPage: PAGE === 1,
        isLastPage: PAGE >= TOTAL_PAGES,
      },
    };
  }

  async AlgoliaProductsWithoutDeal(DealId, pagination) {
    try {
      const deal = await FirebaseHelper.findDocument(
        'deal',
        DealId,
      );
      const items = deal.items || [];
      const dealVariantIds = new Set(
        items.map((item) => item.variantId),
      );

      const inventorySnap = await admin
        .firestore()
        .collection(Variant.collectionName)
        .limit(500)
        .get();
      const variants = FirebaseHelper.mapCollection(inventorySnap);
      const candidateIds = variants
        .map((v) => v.id)
        .filter((id) => !dealVariantIds.has(id));

      const products =
        await AlgoliaProductService.fetchAlgoliaProducts(candidateIds);

      return this._applyPagination(products, pagination);
    } catch (error) {
      throw new Error(
        'Cannot find product information (ProductID or VariantID may be invalid)',
      );
    }
  }
};
