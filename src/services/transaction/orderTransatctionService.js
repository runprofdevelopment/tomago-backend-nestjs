const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Transaction = require('../../database/models/transaction');

module.exports = class OrderTransactionService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Transaction();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(
      this.collectionName,
    );
  }

  async createOrderTransaction(orderData, Batch) {
    try {
      let transaction_data = {
        id: FirebaseHelper.newIdNumber(),
        amount: orderData['totalPrice'],
        userID: orderData['userID'],
        type: `${orderData.paymentMethod}Payment`,
        payerId: orderData['userID'],
        userID: orderData['userID'],
        payeeId: '1',
        operation_details: {
          operation: 'order',
          id: orderData['id'],
        },
      };
      transaction_data = this.model.cast(transaction_data);
      await this.repository.createDocument(
        transaction_data,
        {
          batch: Batch,
          currentUser: this.currentUser,
          language: this.language,
        },
      );
      return transaction_data['id'];
    } catch (e) {
      throw e;
    }
  }

  async createPartialOrderTransaction(orderData, Batch) {
    try {
      let transaction_data = {
        id: FirebaseHelper.newIdNumber(),
        amount: orderData['partialAmountPaid'],
        userID: orderData['userID'],
        type: `${orderData.paymentMethod}Payment`,
        payerId: orderData['userID'],
        userID: orderData['userID'],
        payeeId: '1',
        operation_details: {
          operation: 'order',
          id: orderData['id'],
        },
      };
      transaction_data = this.model.cast(transaction_data);
      await this.repository.createDocument(
        transaction_data,
        {
          batch: Batch,
          currentUser: this.currentUser,
          language: this.language,
        },
      );
      return transaction_data['id'];
    } catch (e) {
      throw e;
    }
  }

  async refundOrderTransaction(orderData, Batch) {
    try {
      const transactionId = `${FirebaseHelper.newIdNumber()}`;
      const transaction_data = this.model.cast({
        id: transactionId,
        amount: orderData['totalPrice'],
        type: `${orderData.paymentMethod}Refund`,
        payerId: '1',
        payeeId: orderData['userID'],
        userID: orderData['userID'],
        operation_details: {
          operation: 'refund',
          id: orderData['id'],
        },
      });

      await this.repository.createDocument(transaction_data, {
        batch: Batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      
      return transactionId;
    } catch (e) {
      throw e;
    }
  }

  async refundOrderTransactionbyItems(
    orderData,
    Batch,
    itemsID = null,
  ) {
    try {
      // Calculate the refund amount
      let refundAmount;
      if (itemsID) {
        // Refund based on specific items
        const itemsToRefund = orderData.items.filter(
          (item) => itemsID.includes(item.variantId),
        );
        refundAmount = itemsToRefund.reduce(
          (sum, item) => sum + item.price,
          0,
        );
      } else {
        // Refund the total order amount
        refundAmount = orderData['totalPrice'];
      }

      // Construct transaction data
      let transaction_data = {
        id: FirebaseHelper.newIdNumber(),
        amount: refundAmount,
        type: `${orderData.paymentMethod}Refund`,
        payerId: '1',
        payeeId: orderData['userID'],
        userID: orderData['userID'],
        operation_details: {
          operation: 'refund',
          id: orderData['id'],
          itemsID: itemsID || null, // Include itemsID if provided
        },
      };

      // Cast and store the transaction data
      transaction_data = this.model.cast(transaction_data);
      await this.repository.createDocument(
        transaction_data,
        {
          batch: Batch,
          currentUser: this.currentUser,
          language: this.language,
        },
      );

      // Return the transaction ID
      return transaction_data['id'];
    } catch (e) {
      throw e;
    }
  }
};