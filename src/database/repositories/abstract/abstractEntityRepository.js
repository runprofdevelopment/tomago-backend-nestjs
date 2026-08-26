const AbstractRepository = require('./abstractRepository');
const admin = require('firebase-admin');
const lodash = require('lodash');

module.exports = class AbstractEntityRepository extends AbstractRepository {
  /**
   * In the case of a two way relationship, both records from both collections
   * must be in sync.
   * This method ensures it for Many to One relations.
   *
   * @param {*} record
   * @param {*} sourceCollectionName
   * @param {*} sourceProperty
   * @param {*} targetCollectionName
   * @param {*} targetProperty
   * @param {*} options
   */
  async refreshTwoWayRelationManyToOne(
    record,
    sourceCollectionName,
    sourceProperty,
    targetCollectionName,
    targetProperty,
    options,
  ) {
    async function removeInOtherRecordsSameType() {
      const sourceCollection = await admin
        .firestore()
        .collection(sourceCollectionName)
        .get();

      const promises = sourceCollection.docs.map(
        async (doc) => {
          const currentRecord = doc.id === record.id;
          const notContainValue =
            !doc.get(sourceProperty) ||
            !doc
              .get(sourceProperty)
              .some((itemA) =>
                record[sourceProperty].some(
                  (itemB) => itemA === itemB,
                ),
              );

          if (currentRecord || notContainValue) {
            return;
          }

          const recordValuesRemoved = lodash.difference(
            doc.get(sourceProperty),
            record[sourceProperty],
          );

          await AbstractEntityRepository.executeOrAddToBatch(
            'update',
            doc.ref,
            {
              [sourceProperty]: recordValuesRemoved,
            },
            options,
          );
        },
      );

      return Promise.all(promises);
    }

    async function refreshRelations() {
      const targetCollection = await admin
        .firestore()
        .collection(targetCollectionName)
        .get();

      const promises = targetCollection.docs.map(
        async (doc) => {
          const isRelation =
            record[sourceProperty] &&
            record[sourceProperty].includes(doc.id);

          if (isRelation) {
            await AbstractEntityRepository.executeOrAddToBatch(
              'update',
              doc.ref,
              {
                [targetProperty]: record.id,
              },
              options,
            );
          }

          if (!isRelation) {
            if (doc.get(targetProperty) === record.id) {
              await AbstractEntityRepository.executeOrAddToBatch(
                'update',
                doc.ref,
                {
                  [targetProperty]: null,
                },
                options,
              );
            }
          }
        },
      );

      return Promise.all(promises);
    }

    await removeInOtherRecordsSameType();
    await refreshRelations();
  }

  /**
   * In the case of a two-way relationship, both records from
   * both collections must be in sync.
   * This method ensures it for One to One relations.
   *
   * @param {*} record
   * @param {*} sourceProperty
   * @param {*} targetCollectionName
   * @param {*} targetProperty
   * @param {*} options
   */
  async refreshTwoWayRelationOneToMany(
    record,
    sourceProperty,
    targetCollectionName,
    targetProperty,
    options,
  ) {
    async function addRelationToTarget() {
      if (!record[sourceProperty]) {
        return;
      }

      await AbstractEntityRepository.executeOrAddToBatch(
        'update',
        admin
          .firestore()
          .doc(
            `${targetCollectionName}/${
              record[sourceProperty]
            }`,
          ),
        {
          [targetProperty]: admin.firestore.FieldValue.arrayUnion(
            record.id,
          ),
        },
        options,
      );
    }

    async function removeRelationOldTargets() {
      const targetCollection = await admin
        .firestore()
        .collection(targetCollectionName)
        .where(targetProperty, 'array-contains', record.id)
        .get();

      const promises = targetCollection.docs.map(
        async (doc) => {
          if (doc.id === record[sourceProperty]) {
            return;
          }

          await AbstractEntityRepository.executeOrAddToBatch(
            'update',
            doc.ref,
            {
              [targetProperty]: admin.firestore.FieldValue.arrayRemove(
                record.id,
              ),
            },
            options,
          );
        },
      );

      return Promise.all(promises);
    }

    await addRelationToTarget();
    await removeRelationOldTargets();
  }

  /**
   * In the case of a two-way relationship, both records from
   * both collections must be in sync.
   * This method ensures it for Many to Many relations.
   *
   * @param {*} record
   * @param {*} sourceProperty
   * @param {*} targetCollectionName
   * @param {*} targetProperty
   * @param {*} options
   */
  async refreshTwoWayRelationManyToMany(
    record,
    sourceProperty,
    targetCollectionName,
    targetProperty,
    options,
  ) {
    const targetCollection = await admin
      .firestore()
      .collection(targetCollectionName)
      .get();

    const promises = targetCollection.docs.map(
      async (doc) => {
        const isRelated =
          record[sourceProperty] &&
          record[sourceProperty].includes(doc.id);

        if (isRelated) {
          await AbstractEntityRepository.executeOrAddToBatch(
            'update',
            doc.ref,
            {
              [targetProperty]: admin.firestore.FieldValue.arrayUnion(
                record.id,
              ),
            },
            options,
          );
        }

        if (!isRelated) {
          if (
            doc.get(targetProperty) &&
            doc.get(targetProperty).includes(record.id)
          ) {
            await AbstractEntityRepository.executeOrAddToBatch(
              'update',
              doc.ref,
              {
                [targetProperty]: admin.firestore.FieldValue.arrayRemove(
                  record.id,
                ),
              },
              options,
            );
          }
        }
      },
    );

    return Promise.all(promises);
  }

  /**
   * If the record is referenced on other collection,
   * clears the referece from the other collection.
   * This method handles the relatino to many.
   *
   * @param {*} recordId
   * @param {*} targetCollectionName
   * @param {*} targetProperty
   * @param {*} options
   */
  async destroyRelationToMany(
    recordId,
    targetCollectionName,
    targetProperty,
    options,
  ) {
    const collection = await admin
      .firestore()
      .collection(targetCollectionName)
      .where(targetProperty, 'array-contains', recordId)
      .get();

    if (collection.empty) {
      return;
    }

    await AbstractEntityRepository.executeOrAddToBatch(
      'update',
      collection.docs[0].ref,
      {
        [targetProperty]: admin.firestore.FieldValue.arrayRemove(
          recordId,
        ),
      },
      options,
    );
  }

  /**
   * If the record is referenced on other collection,
   * clears the referece from the other collection.
   * This method handles the relatino to one.
   *
   * @param {*} recordId
   * @param {*} targetCollectionName
   * @param {*} targetProperty
   * @param {*} options
   */
  async destroyRelationToOne(
    recordId,
    targetCollectionName,
    targetProperty,
    options,
  ) {
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
