const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Cart = new (require('../../database/models/cart'));

module.exports = class CartBuilder {
  static async initCart(context, data) {
    try {
      const userId = data?.userId || context?.currentUser?.id || null;
      data = data || {};
      const cart = Cart.cast({
        ...data,
        id: userId,
        userID: userId,
      });

      const repository = new FirestoreRepository(Cart.collectionName);

      const batch = await FirebaseHelper.createBatch();
      const record = await repository.createDocument(cart, {
        batch,
        currentUser: context.currentUser,
        language: context.language
      });
      await FirebaseHelper.commitBatch(batch);

      return await repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }
}