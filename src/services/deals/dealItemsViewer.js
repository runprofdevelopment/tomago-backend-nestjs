// const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AlgoliaProductService = require('../product/algoliaService');

const Variant = new (require('../../database/models/product-variant'));
const Deal = require('../../database/models/deal');

module.exports = class DealItemsViewer {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.selectedFields = context?.selectedFields || [];
    this.model = new Deal();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async listItemsByDealId(dealId, pagination) {
    const deal = await FirebaseHelper.findDocument(this.collectionName, dealId);
    if (!deal) throw new Error(`Deal not found: ${dealId}`);

    const items = deal.items || [];
    const response = this._applyPagination(items, pagination);

    const variantIds = response.rows.map(item => item.variantId);

    response.rows = await AlgoliaProductService.fetchAlgoliaProducts(variantIds);

    return response;
  }
  

  _applyPagination(data, pagination) {
    const ACTION = (pagination && pagination.action) || 'current';
    const PAGE_SIZE = (pagination && pagination.limit) || 0;
    const PAGE = Math.abs((pagination && pagination.page) || 1);

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
    }
  }

  async fetchProduct(productId, variantId) {
    try {
      const product = await FirebaseHelper.findDocument('product', productId);
      const variant = await FirebaseHelper.findDocument(Variant.collectionName, variantId);

      const record = {
        objectID: variant.id,
        ...product,
        ...variant,
        // main_title: product.title,
        // title: variant.title,
        brandEn: (product.brand && product.brand.en) || null,
        brandAr: (product.brand && product.brand.ar) || null,
        categoriesEn: product.categories ? product.categories.map(name => name.en) : [],
        categoriesAr: product.categories ? product.categories.map(name => name.ar) : [],
        // product_id: product.id,
        // variant_barcode: variant.barcode,
      };

      return record;
    } catch (error) {
      console.log(error);
    }
  }


  // async fetchAlgoliaProducts(items) {
  //   try {
  //     if (!items) return [];
  //     const variantIds = items.map(item => item.variantId);
  //     // let variants = await Algolia.retrieveAllObjects();
  //     const products = await Algolia.getObjects(variantIds);

  //     return products.map(product => {
  //       return {
  //         ...product,
  //         variant_id: product.objectID,
  //       }
  //     });
  //   } catch (error) {
  //     throw new Error('Cannot find product information (ProductID or VariantID may be invalid)')
  //   }
  // }
}