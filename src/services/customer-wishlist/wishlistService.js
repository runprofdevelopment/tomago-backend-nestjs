const { i18n } = require('../../i18n');
const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ErrorHandler = require('../../errors/errorHandler');
const CartEditor = require('../cart/cartEditor');
const CartItemAdder = require('../cart/cartItemAdder');
const Customer = require('../../database/models/customer');

const AlgoliaProductService = require('../product/algoliaService');

module.exports = class WishlistService {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Customer();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async addProductsToWishlist(userId, variantIds = []) {
    const USER_ID = userId || (this.currentUser && this.currentUser.id) || null;

    const fields = [{
      fieldName: 'wishlist',
      fieldValues: variantIds
    }];

    if (!USER_ID) {
      throw new ErrorHandler({
        errorCode: 'USER_NOT_FOUND',
        message: i18n(this.language, 'errors.USER_NOT_FOUND'),
      })
    }

    try {
      const batch = await FirebaseHelper.createBatch();
      await FirebaseHelper.appendItemsToArrayField(this.collectionName, USER_ID, fields, {
        batch: batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async removeProductsFromWishlist(userId, variantIds = [], Batch) {
    const USER_ID = userId || (this.currentUser && this.currentUser.id) || null
    const fields = [{
      fieldName: 'wishlist',
      fieldValues: variantIds
    }]

    if (!USER_ID) {
      throw new ErrorHandler({
        errorCode: 'USER_NOT_FOUND',
        message: i18n(this.language, 'errors.USER_NOT_FOUND'),
      })
    }

    try {
      const batch = Batch || await FirebaseHelper.createBatch();
      await FirebaseHelper.removeItemsFromArrayField(this.collectionName, USER_ID, fields, {
        batch: batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      if (!Batch) await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async existsInMyWishlist(variant_id) {
    const MY_WISHLIST = (this.currentUser && this.currentUser.wishlist) || [];
    return MY_WISHLIST.includes(variant_id);
  }

  /**
   * Retrieve a wishlist by id
   * @param {String} id Wishlist id (Required)
   * @returns {Promise<JSON[]>} Products
   */
  async findById(id) {
    if (!id) {
      throw new ErrorHandler({
        errorCode: 'WISHLIST_NOT_FOUND',
        message: `The wishlist not found`,
      })
    }

    const customer = await this.repository.findDocumentById(id);
    const wishlist = customer.wishlist;
    const products = await this.findProducts(wishlist);
    return products
  }

  async findProducts(wishlist) {
    try {
      if (!wishlist) return [];

      const products =
        await AlgoliaProductService.fetchAlgoliaProducts(wishlist);

      return products;
    } catch (error) {
      throw new Error('Cannot find product information (ProductID or VariantID may be invalid)')
    }
  }

  async moveItemToCart(data) {
    try {
      if (!this.currentUser['wishlist'].includes(data.variantId)) {
        throw new Error('Item does not exist in users wishlist')
      }

      const batch = await FirebaseHelper.createBatch();

      await new CartItemAdder(this.ctx).execute({ 
        variantId: data.variantId, 
        quantity: data.quantity || 1, 
      }, batch);

      await this.removeProductsFromWishlist(this.currentUser.id, [data.variantId], batch);
      await FirebaseHelper.commitBatch(batch);
      return await new FirestoreRepository('cart').findDocumentById(this.currentUser.id);
    } catch (error) {
      throw error;
    }
  }

  async shareMyWishlist() {
    if (!this.currentUser || !this.currentUser.id) {
      throw new ErrorHandler({
        errorCode: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const crypto = require('crypto');
    const shareToken = crypto.randomBytes(16).toString('hex');
    const userId = this.currentUser.id;

    const batch = await FirebaseHelper.createBatch();
    await this.repository.updateDocument(userId, { wishlistShareToken: shareToken }, {
      batch,
      currentUser: this.currentUser,
      language: this.language,
    });
    await FirebaseHelper.commitBatch(batch);

    const baseUrl = process.env.STOREFRONT_URL || process.env.FRONTEND_URL || '';
    const shareUrl = baseUrl
      ? `${baseUrl.replace(/\/$/, '')}/wishlist/shared/${shareToken}`
      : `/wishlist/shared/${shareToken}`;

    return { shareToken, shareUrl };
  }

  async findByShareToken(token) {
    if (!token) {
      throw new ErrorHandler({
        errorCode: 'WISHLIST_NOT_FOUND',
        message: 'The wishlist not found',
      });
    }

    const snapshot = await admin
      .firestore()
      .collection(this.collectionName)
      .where('wishlistShareToken', '==', token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new ErrorHandler({
        errorCode: 'WISHLIST_NOT_FOUND',
        message: 'The wishlist not found',
      });
    }

    const customer = FirebaseHelper.mapDocument(snapshot.docs[0]);
    const products = await this.findProducts(customer.wishlist || []);
    return {
      id: customer.id,
      shareToken: token,
      items: products,
    };
  }
};