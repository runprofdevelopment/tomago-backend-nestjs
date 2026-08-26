const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const Shipment = require('../../database/models/shipment');
const Order = require('../../database/models/order');

module.exports = class ShipmentService {
  constructor({ currentUser, language }) {
    this.language = language;
    this.currentUser = currentUser;
    this.model = new Shipment()
    this.collectionName = this.model.collectionName
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async findById(id) {
    try {
      const viewShippment = await this.repository.findDocumentById(id);
      viewShippment['order'] = await new FirestoreRepository('order').findDocumentById(viewShippment['orderId']);

      return viewShippment;
    }
    catch (e) {
      throw e;
    }
  }

};
