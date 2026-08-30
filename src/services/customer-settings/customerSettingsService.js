const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const ErrorHandler = require('../../errors/errorHandler');
const CustomerSettings = require('../../database/models/customerSettings');

const DEFAULTS = {
  orderUpdatesEnabled: true,
  promotionalEmailsEnabled: true,
  newCollectionAlertsEnabled: true,
  newsletterEnabled: false,
  preferredLanguage: 'en',
  defaultCurrency: 'EGP',
  shippingRegion: null,
  twoFactorEnabled: false,
  loginAlertsEnabled: true,
  passwordLastChangedAt: null,
};

module.exports = class CustomerSettingsService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new CustomerSettings();
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

  async findOrCreateDefaults() {
    const userId = this._requireAuth();
    const existing = await this.repository.findDocumentById(userId);

    if (existing) {
      return existing;
    }

    const data = {
      id: userId,
      customer_id: userId,
      ...this.model.cast(DEFAULTS),
    };

    const batch = await FirebaseHelper.createBatch();
    await this.repository.createDocument(data, {
      batch,
      currentUser: this.currentUser,
      language: this.language,
    });
    await FirebaseHelper.commitBatch(batch);

    return await this.repository.findDocumentById(userId);
  }

  async update(input) {
    const userId = this._requireAuth();
    await this.findOrCreateDefaults();

    const casted = this.model.cast(input || {});
    const data = {};
    Object.keys(input || {}).forEach((key) => {
      if (key in casted) {
        data[key] = casted[key];
      }
    });
    data.customer_id = userId;

    const batch = await FirebaseHelper.createBatch();
    await this.repository.updateDocument(userId, data, {
      batch,
      currentUser: this.currentUser,
      language: this.language,
    });
    await FirebaseHelper.commitBatch(batch);

    return await this.repository.findDocumentById(userId);
  }
};
