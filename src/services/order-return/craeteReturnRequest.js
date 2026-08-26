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

  async createReturnRequest(data) {
    try {
      const order = FirebaseHelper.mapDocument(
        await admin
          .firestore()
          .collection('order')
          .doc(data['orderID'])
          .get(),
      );

      const returnRequest = FirebaseHelper.mapCollection(
        await admin
          .firestore()
          .collection('returnRequest')
          .where('orderID', '==', order.id)
          .get(),
      );
      if (returnRequest.length > 0) {
        throw new Error('Order already has a return request');
      }

      if (order === null) {
        throw new Error('Order not found');
      }
      if (order.orderStatus !== 'received') {
        throw new Error(
          'Cannot return an order that was not received',
        );
      }
      let returned = data['items'];
      for (var i = 0; i < returned.length; i++) {
        if (returned[i].quantity <= 0) {
          throw new Error('Please enter valid quantities');
        }
        let found = order['items'].find((item) => {
          if (item.variantId === returned[i]['variantId']) {
            if (item.quantity < returned[i].quantity) {
              throw new Error(
                `Item with id: ${item.productId} & variant : ${item.variantId} quantity invalid`,
              );
            }
            returned[i]['price'] = item.price;
            return true;
          }
        });

        if (!found) {
          throw new Error('Item was not found in order');
        }
      }
      console.log('RETURNED', returned);
      console.log('ORDER', order);
      console.log('USER', this.currentUser);
      console.log('DATA', data);
      // now you need to check for warranty of each item. (in the returned array or the order array it doesn't matter)
      // ignore the warranty for now
      data['userID'] = this.currentUser.id;
      data = this.model.cast(data);
      data['type'] = 'partialrefund';

      // data['items'] = order['items'].map((item) => {
      //   return {
      //     productId: item.productId,
      //     variantId: item.variantId,
      //     // title: item.variant.title['en'],
      //     quantity: item.quantity,
      //     price: item.price,
      //   };
      // });
      ////////////////////////////////////////////////
      const itemsID = data['items'].map(
        (item) => item.variantId,
      );
      order.items = order.items.map((item) => {
        if (itemsID.includes(item.variantId)) {
          return { ...item, status: 'ReturnRequest' };
        }
        return item;
      });
      /////////////////////////////////////
      console.log('return data', data['items']);
      const batch = await FirebaseHelper.createBatch();

      batch.update(
        admin
          .firestore()
          .collection('order')
          .doc(data['orderID']),
        {
          items: order.items,
        },
      );
      const record = await this.repository.createDocument(
        data,
        {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        },
      );
      console.log('record', record);
      await FirebaseHelper.commitBatch(batch);
      return this.repository.findDocumentById(record.id);
    } catch (e) {
      throw e;
    }
  }
};
