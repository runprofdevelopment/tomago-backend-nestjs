
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const StaticPage = require('../../database/models/staticPage');
const DEFAULT_ID = 'return-and-refund';

module.exports = class ReturnAndRefundService {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new StaticPage();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async findOrCreateDefault() {
    const first = await this.repository.findDocumentById(DEFAULT_ID);

    if (first) {
      return first;
    }

    const record = await this.#createDefault({});
    return record;
  }

  async save(data) {
    data = this.model.cast(data);

    try {
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(DEFAULT_ID, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });
      await FirebaseHelper.commitBatch(batch);
      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      const record = await this.#createDefault(data);
      return record;
      // throw error;
    }
  }


  async #createDefault(data) {
    try {
      data = {
        id: DEFAULT_ID,
        ...this.model.cast(data),
      };

      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
      });
      await FirebaseHelper.commitBatch(batch);
      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }
};