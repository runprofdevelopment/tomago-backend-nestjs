// const { i18n } = require('../../i18n');
const assert = require('assert');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const NotificationSender = require('../notification/notificationSender');
const Customer = require('../../database/models/customer');

module.exports = class DeviceTokenService {
  constructor({ currentUser, language }) {
    this.language = language;
    this.currentUser = currentUser;
    this.model = new Customer();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async addDeviceToken(token) {
    const currentUser = this.currentUser;
    const language = this.language;

    try {
      if (!token) return

      this._validate();
      await this._loadUser();
      const USER_ID = this.user?.id;
      const REGISTRATION_TOKENS = this.user?.deviceTokens || {};
      REGISTRATION_TOKENS[token] = this.language;
      const data = { deviceTokens: REGISTRATION_TOKENS };
      
      new NotificationSender({ language, currentUser }).subscribeUsersToTopic(data, `all_customers_${language}`);
      
      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(USER_ID, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async removeDeviceToken(token) {
    const currentUser = this.currentUser;
    const language = this.language;

    try {
      if (!token) return

      this._validate();
      await this._loadUser();
      const USER_ID = this.user?.id;
      const REGISTRATION_TOKENS = this.user?.deviceTokens || {};
      const REMOVED_DEVICE_TOKEN_LANGUAGE = REGISTRATION_TOKENS[token];
      delete REGISTRATION_TOKENS[token];
      const data = { deviceTokens: REGISTRATION_TOKENS };

      const REMOVED_DEVICE_TOKEN = {};
      REMOVED_DEVICE_TOKEN[token] = REMOVED_DEVICE_TOKEN_LANGUAGE;
      new NotificationSender({ language, currentUser }).unsubscribeUsersFromTopic({
        deviceTokens: REMOVED_DEVICE_TOKEN
      }, `all_customers_${language}`);

      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(USER_ID, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async _loadUser() {
    this.user = await this.repository.findDocumentById(
      this.currentUser.id,
    );
  }

  _validate() {
    assert(this.currentUser, 'currentUser is required');
    assert(this.currentUser.id, 'currentUser.id is required');
  }
};