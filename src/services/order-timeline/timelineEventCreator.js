const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Timeline = new (require('../../database/models/orderTimeline'));

module.exports = class TimelineEventCreator {

  static async execute({ orderId, event_type, event_description }, context, Batch) {
    try {
      const data = this._preSave({ orderId, event_type, event_description });

      const batch = Batch || await FirebaseHelper.createBatch();
      const collectionPath = `order/${orderId}/${Timeline.collectionName}`;
      const repository = new FirestoreRepository(collectionPath);
      
      await repository.createDocument(data, {
        batch,
        currentUser: context.currentUser,
        language: context.language, 
      });
      if (!Batch) await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  static _preSave(data) {
    data = {
      ...Timeline.cast(data),
      id: `${FirebaseHelper.newIdNumber()}`,
      order_id: data.orderId,
    };

    if (data.event_type) {
      data['normalize_event_type'] = HelperFunctions.stringNormalization(data.event_type);
    }

    return data;
  }
}

// {
//   orderCreated: 'Order was placed by the user.'
//   paymentProcessed: 'Payment was successfully processed.',
//   orderConfirmed: 'Order was confirmed by the system.',
//   orderPacked: 'Order was packed and ready for shipping.',
//   orderShipped: 'Order was shipped via XYZ carrier.',
//   outForDelivery: 'Order is out for delivery.'
// }