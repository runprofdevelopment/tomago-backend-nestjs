const admin = require('firebase-admin');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Timeline = new (require('../../database/models/orderTimeline'));


module.exports = class TimelineViewer {
  static async fetchOrderTimeline(orderId) {
    try {
      const collectionPath = `order/${orderId}/${Timeline.collectionName}`;

      const records = FirebaseHelper.mapCollection(
        await admin.firestore().collection(collectionPath).orderBy('createdAt', 'desc').get()
      );

      const timeline = this.populateAll(records);
      return timeline;
    } catch (error) {
      throw error;
    }
  }

  static async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record))
    );
  }

  static async populate(record) {
    if (!record) {
      return record;
    }

    record['creator'] = await FirebaseHelper.findDocument('user', record.createdBy);

    return record;
  }
}