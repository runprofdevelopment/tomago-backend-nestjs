const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Ad = require('../../database/models/ad');

module.exports = class AdViewer {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.selectedFields = context?.selectedFields || [];
    this.model = new Ad();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async findById(id) {
    const record = await this.repository.findDocumentById(id);
    return record;
  }

  async listWithPagination(args) {
    args['filter'] = args.filter || []
    const response = await this.repository.listCollection(args);
    return response;
  }

  async listAll() {
    const selectedFields = ['id', 'title'];
    let query = admin.firestore().collection(this.collectionName).select(...selectedFields);

    // if (status) {
    //   query = query.where('status', '==', status);
    // }

    const records = FirebaseHelper.mapCollection(await query.get());
    return records;
  }
}