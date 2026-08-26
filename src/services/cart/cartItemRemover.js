const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const CartBuilder = require('./cartBuilder');
const CartUtils = require('./cartUtils');
const Cart = require('../../database/models/cart');

module.exports = class CartItemRemover {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Cart();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async execute(data) {
    try {
      const cartId = data?.userId || this.currentUser.id;
      const variantId = data?.variantId;

      if (!cartId) throw new Error('User is not logged in or cart not found');
      if (!variantId) throw new Error('VariantId is required');

      const cartRef = admin.firestore().collection(this.collectionName).doc(cartId);

      // Fetch the Cart 
      const doc = await cartRef.get();
      if (doc.exists) {
        // Get the current array
        let items = doc.data().items || [];

        // Filter out the object you want to remove
        items = items.filter(item => item.variantId !== variantId);

        // Calculate new total quantity
        const totalQty = CartUtils.calculateTotalQty(items);

        // Write the new array back to Firestore
        await cartRef.update({ 
          items: items,
          totalQty: totalQty,
        });

        // Return the updated cart data
        return {
          id: cartId,
          userID: cartId,
          items: items,
          totalQty: totalQty,
        };
      } else {
        // Initialize empty cart if it doesn't exist
        const emptyCart = await CartBuilder.initCart(this.context, { userId: cartId });
        return emptyCart;
      }
    } catch (error) {
      throw error;
    }
  }

  // async execute(data, Batch) {
  //   try {
  //     const cartId = data.userId || this.currentUser.id;
  //     const productId = data?.item?.productId;
  //     const variantId = data?.item?.variantId;

  //     if (!cartId) throw new Error('User is not logged in or cart not found');
  //     if (!variantId) throw new Error('VariantId is required');
  //     if (!productId) throw new Error('ProductId is required');

  //     const cart = await this.repository.findDocumentById(cartId);
  //     if (!cart) return await CartBuilder.initCart(this.context);

  //     const items = cart.items || [];
  //     if (!items.length) throw new Error('Cart is empty');

  //     const cartItemIndex = items.findIndex((item) => item.productId === productId && item.variantId === variantId);
  //     if (cartItemIndex !== -1) {
  //       items.splice(cartItemIndex, 1);
  //     }

  //     data = {
  //       items: items,
  //       totalQty: CartUtils.calculateTotalQty(items),
  //     }

  //     const batch = Batch || await FirebaseHelper.createBatch();
  //     const record = await this.repository.updateDocument(cartId, data, {
  //       batch,
  //       currentUser: this.currentUser,
  //       language: this.language,
  //     });
  //     if (!Batch) await FirebaseHelper.commitBatch(batch);

  //     return await this.repository.findDocumentById(record.id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}