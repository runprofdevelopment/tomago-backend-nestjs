const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const ErrorHandler = require('../../errors/errorHandler');
const CustomRequest = require('../../database/models/customRequest');

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
};
