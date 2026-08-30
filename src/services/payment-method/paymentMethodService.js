const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ErrorHandler = require('../../errors/errorHandler');
const PaymentMethod = require('../../database/models/paymentMethod');
const orderViewer = require('../order/orderViewer');

module.exports = class PaymentMethodService {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new PaymentMethod();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  _requireAuth() {
    if (!this.currentUser || !this.currentUser.id) {
      throw new ErrorHandler({
        errorCode: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }
    return this.currentUser.id;
  }

  /**
   * Strip full PAN if provided; persist only last_four. Never persist CVV.
   */
  _sanitizeCardData(data) {
    const input = { ...(data || {}) };
    delete input.cvv;
    delete input.CVV;
    delete input.cvc;
    delete input.security_code;

    if (input.card_number) {
      const digits = String(input.card_number).replace(/\D/g, '');
      input.last_four = digits.slice(-4);
      delete input.card_number;
    }

    delete input.cardNumber;
    delete input.pan;
    delete input.full_number;

    return input;
  }

  async listMyPaymentMethods() {
    const customerId = this._requireAuth();
    const args = {
      filter: [{ field: 'customer_id', operator: 'equal', value: customerId }],
      orderBy: 'createdAt',
      pagination: { limit: 100, sortBy: 'desc', action: 'current' },
    };
    const response = await this.repository.listCollection(args);
    return response.rows || [];
  }

  async myBillingHistory(args = {}) {
    const customerId = this._requireAuth();
    return new orderViewer(this.context).listCustomerOrders({
      ...args,
      customerId,
    });
  }

  async create(data) {
    const customerId = this._requireAuth();
    const sanitized = this._sanitizeCardData(data);
    const casted = this.model.cast({
      ...sanitized,
      customer_id: customerId,
    });
    casted.customer_id = customerId;

    if (!casted.last_four) {
      throw new ErrorHandler({
        errorCode: 'VALIDATION_ERROR',
        message: 'last_four is required (or provide card_number to derive it)',
      });
    }

    const batch = await FirebaseHelper.createBatch();
    const record = await this.repository.createDocument(casted, {
      batch,
      currentUser: this.currentUser,
      language: this.language,
    });

    if (casted.is_default) {
      await this._clearOtherDefaults(customerId, record.id, batch);
    }

    await FirebaseHelper.commitBatch(batch);
    return await this.repository.findDocumentById(record.id);
  }

  async update(id, data) {
    const customerId = this._requireAuth();
    const existing = await this.repository.findDocumentById(id);

    if (!existing || existing.customer_id !== customerId) {
      throw new ErrorHandler({
        errorCode: 'NOT_FOUND',
        message: 'Payment method not found',
      });
    }

    const sanitized = this._sanitizeCardData(data);
    const casted = this.model.cast(sanitized);
    const updateData = {};
    Object.keys(sanitized).forEach((key) => {
      if (key in casted && key !== 'customer_id') {
        updateData[key] = casted[key];
      }
    });

    const batch = await FirebaseHelper.createBatch();
    await this.repository.updateDocument(id, updateData, {
      batch,
      currentUser: this.currentUser,
      language: this.language,
    });

    if (updateData.is_default) {
      await this._clearOtherDefaults(customerId, id, batch);
    }

    await FirebaseHelper.commitBatch(batch);
    return await this.repository.findDocumentById(id);
  }

  async destroy(id) {
    const customerId = this._requireAuth();
    const existing = await this.repository.findDocumentById(id);

    if (!existing || existing.customer_id !== customerId) {
      throw new ErrorHandler({
        errorCode: 'NOT_FOUND',
        message: 'Payment method not found',
      });
    }

    const batch = await FirebaseHelper.createBatch();
    await this.repository.destroyDocument(id, {
      batch,
      currentUser: this.currentUser,
      language: this.language,
    });
    await FirebaseHelper.commitBatch(batch);
    return true;
  }

  async setDefault(id) {
    const customerId = this._requireAuth();
    const existing = await this.repository.findDocumentById(id);

    if (!existing || existing.customer_id !== customerId) {
      throw new ErrorHandler({
        errorCode: 'NOT_FOUND',
        message: 'Payment method not found',
      });
    }

    const batch = await FirebaseHelper.createBatch();
    await this.repository.updateDocument(id, { is_default: true }, {
      batch,
      currentUser: this.currentUser,
      language: this.language,
    });
    await this._clearOtherDefaults(customerId, id, batch);
    await FirebaseHelper.commitBatch(batch);
    return await this.repository.findDocumentById(id);
  }

  async _clearOtherDefaults(customerId, keepId, batch) {
    const snapshot = await admin
      .firestore()
      .collection(this.collectionName)
      .where('customer_id', '==', customerId)
      .where('is_default', '==', true)
      .get();

    for (const doc of snapshot.docs) {
      if (doc.id !== keepId) {
        await this.repository.updateDocument(doc.id, { is_default: false }, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });
      }
    }
  }
};
