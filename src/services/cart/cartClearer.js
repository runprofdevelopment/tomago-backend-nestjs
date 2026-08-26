const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Cart = new (require('../../database/models/cart'));

module.exports = class CartClearer {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.collectionName = Cart.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async clearMyCart(Batch) {
    try {
      const cartId = this?.currentUser?.id;
      const emptyCart = Cart.cast({ id: cartId, userID: cartId });

      const batch = Batch || await FirebaseHelper.createBatch();
      await this.repository.updateDocument(cartId, emptyCart, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      if (!Batch) await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  static async clearUserCart(userId, Batch) {
    try {
      if (!userId) throw new Error('userId is required');
      
      const cartId = userId;
      const emptyCart = Cart.cast({ id: cartId, userID: cartId });

      const batch = Batch || await FirebaseHelper.createBatch();
      const docRef = admin.firestore().doc(`cart/${cartId}`);
      batch.update(docRef, { ...emptyCart, updatedAt: new Date() });
      if (!Batch) await FirebaseHelper.commitBatch(batch);

      return true;
    } catch (error) {
      if (error.code === 5) {
        throw new Error(`No user found with the ID: "${userId}".`);
      }
      throw error;
    }
  }
}