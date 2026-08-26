const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ReturnRequest = require('../../database/models/returnRequest');

module.exports = class ReturnService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new ReturnRequest();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  requestClosed(request) {
    if (
      request['status'] === 'rejected' ||
      request['status'] === 'confirmed'
    ) {
      throw new Error(
        "This request's status is " +
          request['status'] +
          ' and cannot be changed now',
      );
    }
  }

  async rejectReturnRequest(data) {
    try {
      const request =
        await this.repository.findDocumentById(data.id);
      if (!request) {
        throw new Error('Cannot find Return Request');
      }
      console.log(request, 'gggggggg');
      this.requestClosed(request);
      const status_update = {
        status: 'rejected',
        reason: data.rejectReason,
      };
      const order = FirebaseHelper.mapDocument(
        await admin
          .firestore()
          .collection('order')
          .doc(request.orderID)
          .get(),
      );

      const itemsID = request['items'].map((item) => item.variantId);
      order.items = order.items.map((item) => {
        if (itemsID.includes(item.variantId)) {
          return { ...item, status: 'rejected' };
        }
        return item;
      });
      const batch = await FirebaseHelper.createBatch();
      batch.update(
        admin
          .firestore()
          .collection('order')
          .doc(request.orderID),
        {
          items: order.items,
        }
      )
      const record = await this.repository.updateDocument(
        data.id,
        status_update,
        {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        },
      );

      console.log('record rejected', record);
      await FirebaseHelper.commitBatch(batch);
      return this.repository.findDocumentById(record.id);
    } catch (e) {
      throw e;
    }
  }
};
