const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const ErrorHandler = require('../../errors/errorHandler');
const CustomRequest = require('../../database/models/customRequest');
const { v4: uuidv4 } = require('uuid');

module.exports = class CustomRequestService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new CustomRequest();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  _preSave(data) {
    data = this.model.cast(data);

    if (data && data.full_name) {
      data['normalize_full_name'] = HelperFunctions.stringNormalization(data.full_name);
    }
    if (data && data.email) {
      data['normalize_email'] = HelperFunctions.stringNormalization(data.email);
    }
    if (!data.status) {
      data.status = 'pending';
    }

    return data;
  }

  async create(input) {
    const data = this._preSave(input || {});

    if (this.currentUser && this.currentUser.id) {
      data.customer_id = data.customer_id || this.currentUser.id;
    }

    const batch = await FirebaseHelper.createBatch();
    const record = await this.repository.createDocument(data, {
      batch,
      currentUser: this.currentUser,
      language: this.language,
    });
    await FirebaseHelper.commitBatch(batch);

    return await this.repository.findDocumentById(record.id);
  }

  async myCustomRequests(args = {}) {
    if (!this.currentUser || !this.currentUser.id) {
      throw new ErrorHandler({
        errorCode: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    const filter = args.filter || [];
    filter.push({
      field: 'customer_id',
      operator: 'equal',
      value: this.currentUser.id,
    });

    const response = await this.repository.listCollection({
      ...args,
      filter,
    });
    return response;
  }

  async list(args = {}) {
    const response = await this.repository.listCollection(args);
    return response;
  }

  async reply(id, input = {}) {
    if (!this.currentUser || !this.currentUser.id) {
      throw new ErrorHandler({
        errorCode: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    if (!id) {
      throw new ErrorHandler({
        errorCode: 'VALIDATION_ERROR',
        message: 'Request id is required',
      });
    }

    if (!input.body || typeof input.body !== 'string' || !input.body.trim()) {
      throw new ErrorHandler({
        errorCode: 'VALIDATION_ERROR',
        message: 'Reply body is required',
      });
    }

    if (input.estimatedPrice == null || typeof input.estimatedPrice !== 'number') {
      throw new ErrorHandler({
        errorCode: 'VALIDATION_ERROR',
        message: 'Estimated price is required',
      });
    }

    const request = await this.repository.findDocumentById(id);
    if (!request) {
      throw new ErrorHandler({
        errorCode: 'NOT_FOUND',
        message: 'Custom request not found',
      });
    }

    if (request.status === 'closed') {
      throw new ErrorHandler({
        errorCode: 'VALIDATION_ERROR',
        message: 'Cannot reply to a closed request',
      });
    }

    const messages = Array.isArray(request.messages)
      ? [...request.messages]
      : [];

    messages.push({
      id: uuidv4(),
      sender_type: 'seller',
      sender_name:
        this.currentUser.fullName ||
        this.currentUser.email ||
        null,
      body: input.body.trim(),
      created_at: new Date().toISOString(),
    });

    const batch = await FirebaseHelper.createBatch();
    await this.repository.updateDocument(
      id,
      {
        status: 'replied',
        estimated_price: input.estimatedPrice,
        estimated_delivery_time: input.estimatedDeliveryTime || null,
        messages,
      },
      {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      },
    );
    await FirebaseHelper.commitBatch(batch);

    return await this.repository.findDocumentById(id);
  }

  async _changeStatus(id, nextStatus, actionLabel) {
    if (!this.currentUser || !this.currentUser.id) {
      throw new ErrorHandler({
        errorCode: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    if (!id) {
      throw new ErrorHandler({
        errorCode: 'VALIDATION_ERROR',
        message: 'Request id is required',
      });
    }

    const request = await this.repository.findDocumentById(id);
    if (!request) {
      throw new ErrorHandler({
        errorCode: 'NOT_FOUND',
        message: 'Custom request not found',
      });
    }

    if (request.status === 'closed') {
      throw new ErrorHandler({
        errorCode: 'VALIDATION_ERROR',
        message: `Cannot ${actionLabel} a closed request`,
      });
    }

    const batch = await FirebaseHelper.createBatch();
    await this.repository.updateDocument(
      id,
      { status: nextStatus },
      {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      },
    );
    await FirebaseHelper.commitBatch(batch);

    return await this.repository.findDocumentById(id);
  }

  async accept(id) {
    return this._changeStatus(id, 'closed', 'accept');
  }

  async cancel(id) {
    return this._changeStatus(id, 'closed', 'cancel');
  }

  async close(id) {
    return this._changeStatus(id, 'closed', 'close');
  }
};
