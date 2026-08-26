const AbstractRepository = require('./abstractRepository');
const admin = require('firebase-admin');
const lodash = require('lodash');

module.exports = class abstractRelationRepository extends AbstractRepository {
  async createRelationOneToOne(
    recordId,
    targetCollectionName,
    targetProperty,
    options,
  ) {
    const record = {
      id: recordId,
      relatedTo: {},
      // ...new City().cast(data),
      createdBy: this.getCurrentUser(options).id,
      createdAt: this.serverTimestamp(),
      updatedBy: this.getCurrentUser(options).id,
      updatedAt: this.serverTimestamp(),
    };

    await AbstractEntityRepository.executeOrAddToBatch(
      'set',
      admin
      .firestore()
      // .doc(`${new City().collectionName}/${record.id}`),
      .doc(`relation/${record.id}`),
      record,
      options,
    );

    const collection = await admin
      .firestore()
      .collection(targetCollectionName)
      .where(targetProperty, '==', recordId)
      .get();

    if (collection.empty) {
      return;
    }

    await AbstractEntityRepository.executeOrAddToBatch(
      'update',
      collection.docs[0].ref,
      {
        [targetProperty]: null,
      },
      options,
    );
  }
};
