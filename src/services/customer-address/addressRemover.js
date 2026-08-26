const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Customer = new (require('../../database/models/customer'));
const Address = new (require('../../database/models/address'));


module.exports = class AddressRemover {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.customerId = null;
    this.repository = new FirestoreRepository(Address.collectionName);
  }

  /** Permanently delete the address (Delete immediately) */
  async destroy(customerId, id) {
    this.customerId = customerId || this.currentUser.id;

    try {
      const Address = await FirebaseHelper.findDocument(this.collectionPath, id);

      const batch = await FirebaseHelper.createBatch();
      await this.repository.destroyDocument(id, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
        collectionPath: this.collectionPath,
      });

      if (Address && Address.default) {
        const sellected_address = FirebaseHelper.mapCollection(
          await admin.firestore().collection(this.collectionPath)
            .where('default', '==', false)
            .orderBy('createdAt', 'desc').limit(1).get()
        );
        const addressId = sellected_address.length ? sellected_address[0].id : null;
        if (addressId) {
          const documentRef = admin.firestore().doc(`${this.collectionPath}/${addressId}`);
          batch.update(documentRef, { default: true });
        }
      }

      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  get collectionPath() {
    const customer_id = this.customerId || this.currentUser.id;
    const collection_path = `${Customer.collectionName}/${customer_id}/${Address.collectionName}`;
    return collection_path;
  }
};