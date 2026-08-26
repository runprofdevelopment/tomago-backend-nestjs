const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ErrorHandler = require('../../errors/errorHandler');
const InventoryViewer = require('../inventory/inventoryViewer')
const CartBuilder = require('./cartBuilder');
const CartUtils = require('./cartUtils');
const Cart = require('../../database/models/cart');

module.exports = class CartEditor {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Cart();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async moveToWishlist(variantId) {
    try {
      const cartId = this?.currentUser?.id;

      const fields = [{
        fieldName: 'wishlist',
        fieldValues: [variantId]
      }];

      const batch = await FirebaseHelper.createBatch();

      let cart = await this.repository.findDocumentById(cartId);
      if (!cart) cart = await CartBuilder.initCart(this.context);

      const items = cart.items || [];
      if (!items.length) throw new Error('Cart is empty');

      const updatedItems = {
        items: items.filter(item => item.variantId !== variantId),
        totalQty: CartUtils.calculateTotalQty(items),
      }

      await this.repository.updateDocument(cartId, updatedItems, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });

      await FirebaseHelper.appendItemsToArrayField('user', this.currentUser.id, fields, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async mergeAnonymousCartToUserCart(anonymous_cartId) {
    try {
      if (!anonymous_cartId) return {};

      const currentUserId = this.currentUser?.id || null;

      const anonymousCart = await FirebaseHelper.findDocument(this.collectionName, anonymous_cartId);
      const items = anonymousCart?.items || [];
    
      const batch = await FirebaseHelper.createBatch();

      if (currentUserId && items.length > 0) {
        const userCart = await FirebaseHelper.findDocument(this.collectionName, currentUserId);

        if (userCart) {
          const cartItems = userCart.items || [];

          for (const item of items) {
            const index = cartItems.findIndex(el => el.variantId === item.variantId);

            if (index > -1) {
              cartItems[index].quantity += item.quantity;
            } else {
              cartItems.push(item);
            }
          }
          userCart['items'] = cartItems;
          userCart['totalQty'] = CartUtils.calculateTotalQty(userCart.items);

          const data = {
            items: userCart['items'],
            totalQty: userCart['totalQty']
          }

          await this.repository.updateDocument(currentUserId, data, {
            batch,
            currentUser: this.currentUser,
            language: this.language,
          });
        } else {
          const data = this.model.cast({
            ...anonymousCart,
            id: this.currentUser.id,
            userID: this.currentUser.id,
          });

          await this.repository.createDocument(data, {
            batch,
            currentUser: this.currentUser,
            language: this.language
          });
        }
      }
      
      if (anonymous_cartId !== currentUserId) {
        // delete anonymous cart
        await this.repository.destroyDocument(anonymous_cartId, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        })

        // delete anonymous user from authentication table
        await admin.auth().deleteUser(anonymous_cartId);
      }

      await FirebaseHelper.commitBatch(batch);

      const CartViewer = require('./cartViewer');
      return await new CartViewer({ 
        currentUser: this.currentUser, 
        language: this.language 
      }).findMyCart();

    } catch (error) {
      throw error;
    }
  }
}