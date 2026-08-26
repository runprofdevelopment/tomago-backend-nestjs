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

  async viewMyReturnRequests() {
    const requests = FirebaseHelper.mapCollection(
      await admin
        .firestore()
        .collection(this.collectionName)
        .where('userID', '==', this.currentUser.id)
        .get(),
    );
    return requests;
  }
};
