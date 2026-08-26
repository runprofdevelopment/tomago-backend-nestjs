const { i18n } = require('../../i18n');
const lodash = require('lodash');
const ErrorHandler = require('../../errors/errorHandler');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Notification = require('../../database/models/notification');

module.exports = class NotificationCreator {
  constructor(context) {
    this.language = (context && context.language) || null;
    this.currentUser = context && context.currentUser || null;
    this.model = new Notification();
    this.repository = new FirestoreRepository();
    
    // this.collectionName = this.model.collectionName;
    // this.repository = new FirestoreRepository(this.collectionName);
  }

  _preSave(data) {
    data = this.model.cast(data);

    if (data.title) {
      data['normalize_title'] = {
        en: HelperFunctions.stringNormalization(data.title, 'en'),
        ar: HelperFunctions.stringNormalization(data.title, 'ar'),
      }
    }
    return data;
  }

  /**
   * Create a new notification
   * @param {String} userId Send To
   * @param {Object} data 
   * @param {Object} data.title
   * @param {String} data.title.en
   * @param {String} data.title.ar
   * @param {Object} data.body
   * @param {String} data.body.en
   * @param {String} data.body.ar
   * @param {Url<String>} data.imageUrl
   * @param {JSON} data.payload 
   * @returns {Promise<JSON>} Notification record
   */
  async execute(userId, data, batch) {
    try {
      data = this._preSave(data);

      const Batch = batch || await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch: Batch,
        currentUser: this.currentUser,
        language: this.language,
        collectionPath: `user/${userId}/${this.model.collectionName}`,
      });

      await FirebaseHelper.incrementCounter(`user/${userId}/${this.model.collectionName}`, 'unread-messages', Batch);
      if (!batch) await FirebaseHelper.commitBatch(Batch);
      return record
    } catch (error) {
      throw error;
    }
  }
};