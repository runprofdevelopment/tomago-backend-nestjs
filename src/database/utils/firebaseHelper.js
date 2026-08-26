const lodash = require('lodash');
const admin = require('firebase-admin');
// const bucket = admin.storage().bucket();
// const functions = require('firebase-functions');
const HelperFunctions = require('../../utils/helperFunctions');
const ErrorHandler = require('../../errors/errorHandler')
const Pagination = require('../models/defaults/pagination')

const increment = admin.firestore.FieldValue.increment(1);
const decrement = admin.firestore.FieldValue.increment(-1);
const deleteField = admin.firestore.FieldValue.delete();
const FieldParameter = {
  fieldName: '',
  fieldValues: []
}

/**
 * Abstracts some basic Firestore operations.
 * - See https://firebase.google.com/docs/firestore
 */
module.exports = class FirebaseHelper {
  /** Cleans the database. */
  static async cleanDatabase() {
    throw new Error('Not implemented');
  }

  /**
   * Returns a Firestore DocumentReference.
   * @param {String} collectionName The name of the collection.
   * @param {String} documentId The ID of the document.
   * @returns {firebase.firestore.DocumentReference}
   */
  static getFirestoreDocumentRef(collectionName, documentId) {
    return admin.firestore().collection(collectionName).doc(documentId);
  }

  /** Creates a new Firestore ID. */
  static newId() {
    return admin.firestore().collection(`ids`).doc().id;
  }

  /** Create a unique number with javascript time */
  static newIdNumber() {
    return Math.floor(Date.now().valueOf() * Math.random())
  }

  /** 
   * Creates a new Index. 
   * @param {String} [collectionName] The collection name 
   * @param {Boolean} inShared This is to generate indexes in the SharedInfo collection or in collectionName
   * @returns {Promise<Number>} The new index
   */
  static async newIndex(collectionName, inShared = true) {
    // const indexRef = admin.firestore().collection(`--SharedInfo--`).doc(`--${collectionName}-index--`);
    const collectionPath = inShared ? `--SharedInfo--` : collectionName
    const documentId = collectionName && inShared ? `--${collectionName}-index--` : `--index--`
    const indexRef = admin.firestore().collection(collectionPath).doc(documentId);
    await indexRef.set({ count: increment }, { merge: true });
    const document = await indexRef.get();
    return document.data().count;
  }

  static async reduceIndex(collectionName, inShared = true, batch) {
    // const indexRef = admin.firestore().collection(`--SharedInfo--`).doc(`--${collectionName}-index--`);
    const collectionPath = inShared ? `--SharedInfo--` : collectionName
    const documentId = collectionName && inShared ? `--${collectionName}-index--` : `--index--`
    const indexRef = admin.firestore().collection(collectionPath).doc(documentId);

    batch 
      ? await batch.set(indexRef, { count: decrement }, { merge: true }) 
      : await indexRef.set({ count: decrement }, { merge: true })
  }

  static async incrementCounter(collectionPath, counterName, batch) {
    const documentId = `--${counterName}--`
    const indexRef = admin.firestore().collection(collectionPath).doc(documentId);

    batch 
      ? await batch.set(indexRef, { count: increment }, { merge: true }) 
      : await indexRef.set({ count: increment }, { merge: true });

    // const document = await indexRef.get();
    // return document.data().count;
  }

  static async decrementCounter(collectionPath, counterName, batch) {
    const documentId = `--${counterName}--`
    const indexRef = admin.firestore().collection(collectionPath).doc(documentId);

    batch 
      ? await batch.set(indexRef, { count: decrement }, { merge: true }) 
      : await indexRef.set({ count: decrement }, { merge: true });
  }

  static async getCounter(collectionPath, counterName) {
    const documentId = `--${counterName}--`
    const indexRef = admin.firestore().collection(collectionPath).doc(documentId);
    const document = await indexRef.get();
    return document.data().count;
  }

  /** Creates a Firestore Batch. */
  static async createBatch() {
    return admin.firestore().batch();
  }

  /** Commits the current batch. */
  static async commitBatch(batch) {
    try{
      return await batch.commit();
    } catch(error){
      throw error;
    }
  }

  /**
   * Returns the current batch if it exists on the options.
   * @param {object} options
   */
  static getBatch(options) {
    return (options && options.batch) || undefined;
  }

  /**
   * Returns the currentUser if it exists on the options.
   * @param {object} options
   */
  static getCurrentUser(options) {
    return (options && options.currentUser) || { id: null };
  }

  /** Creates a server timestamp. */
  static serverTimestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  /** Replace Firestore timestamps to Date. */
  static replaceTimestampToDate(date) {
    if (date && date instanceof admin.firestore.Timestamp) {
      return date.toDate();
    }
    return date
  }

  /** Replaces all Firestore timestamps to Date. */
  static replaceAllTimestampToDate(arg) {
    if (!arg) return arg;

    Object.keys(arg).forEach((key) => {
      const value = arg[key];
      if (arg[key] && arg[key] instanceof admin.firestore.Timestamp) {
        arg[key] = arg[key].toDate();
      }
    });
  }

  /** Replaces all Firestore timestamps to Time. */
  static replaceAllTimestampToTime(arg) {
    if (!arg) return arg;

    Object.keys(arg).forEach((key) => {
      if (arg[key] && arg[key] instanceof admin.firestore.Timestamp) {
        arg[key] = new Date(arg[key].toDate());
        arg[key] = arg[key].getTime();
      }
    });
  }

  /**
   * Converts the value to Firestore Timestamp if it's not.
   * @param {*} value
   */
  static convertToTimestampIfIsNot(value) {
    if (!value) {
      return value;
    }

    if (!(value instanceof admin.firestore.Timestamp)) {
      if (lodash.isNumber(value)) {
        return admin.firestore.Timestamp.fromMillis(value);
      }

      if (lodash.isDate(value)) {
        const date = new Date(value)
        return admin.firestore.Timestamp.fromDate(date);
      }

      throw new Error(`Error adding audition fields!`);
    }

    return value;
  }

  /**
   * This function is used for several purposes, namely creating, updating, or deleting
   * - Executes if no batch is informed.
   * - Adds to the batch if it exists.
   * @param {'set'|'update'|'delete'} operation Required
   * @param {firebase.firestore.DocumentReference} document The document reference Ex: admin.firestore().doc(collectionName/id),
   * @param {JSON} data
   * @param {Object} [options]
   * @param {admin.firestore.WriteBatch} options.batch
   * @returns
   */
  static async executeOrAddToBatch(operation, document, data, options) {
    const batch = this.getBatch(options);

    if (batch) {
      if (operation !== 'delete') {
        batch[operation](document, data);
      } else {
        batch[operation](document);
      }
      return;
    }

    if (operation !== 'delete') {
      return document[operation](data);
    } else {
      return document[operation];
    }
  }

  /**
   * To delete specific fields from a document in firestore
   * @param {String} collectionPath (Required)
   * @param {String} id (Required)
   * @param {String[]} fieldsName (Required)
   * @param {Object} [options]
   * @param {admin.firestore.WriteBatch} options.batch
   */
  static async deleteDocumentFields(collectionPath, id, fieldsName, options) {
    const documentRef = admin.firestore().doc(`${collectionPath}/${id}`)
    const deleteFields = {}

    fieldsName.forEach(fieldName => {
      deleteFields[fieldName] = admin.firestore.FieldValue.delete()
    })

    const batch = this.getBatch(options);
    if (batch) {
      batch.update(documentRef, deleteFields)
    } else {
      documentRef.update(deleteFields);
    }
  }

  /**
   * - See: https://cloud.google.com/firestore/docs/samples/firestore-data-delete-collection
   * @param {*} collectionPath 
   * @param {*} batchSize 
   * @returns 
   */
  static async deleteCollection(collectionPath, batchSize) {
    const db = admin.firestore()
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }
  
  static async deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }
  
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      this.deleteQueryBatch(db, query, resolve);
    });
  }

  /**
   * Finds a document relation. Collection or Doc.
   * @param {*} collectionName
   * @param {*} value
   */
  static async findRelation(collectionName, value) {
    if (!value) {
      return value;
    }

    if (Array.isArray(value)) {
      return this.findDocuments(collectionName, value);
    }

    return this.findDocument(collectionName, value);
  }

  /**
   * Finds a document.
   * @param {String} collectionPath
   * @param {String} id
   */
  static async findDocument(collectionPath, id) {
    return this.mapDocument(
      await admin.firestore().doc(`${collectionPath}/${id}`).get()
    );
  }

  /**
   * Finds several documents.
   * @param {String} collectionPath
   * @param {String[]} ids
   * @returns {Promise<JSON[]>}
   */
  static async findDocuments(collectionPath, ids) {
    const documents = await Promise.all(
      ids.map(id => this.findDocument(collectionPath, id))
    );
    return documents.filter(document => document != null)
  } 

  static async findDocumentsByIds(collectionPath, ids) {
    const documents = await Promise.all(
      ids.map(id => this.findDocument(collectionPath, id))
    );
    return documents.filter(document => document != null)
  } 

  static async findDocumentsByIds(collectionPath, ids) {
    const totalCountOfIds = ids.length;
    const maximumNumOfIds = 10;
    const numberOfChains = Math.ceil(totalCountOfIds / maximumNumOfIds);
    const GroupOfPackets = [];

    for (let index = 0; index < numberOfChains; index++) {
      const start = maximumNumOfIds * index;
      const end = maximumNumOfIds * (index +1);
      const packetOfIds = ids.slice(start, end);
      GroupOfPackets.push(packetOfIds);
    }

    const PromiseResult = await Promise.allSettled(
      GroupOfPackets.map(packetsOfIds => this.#findDocuments(collectionPath, packetsOfIds))
    )

    const records = []
    for (const result of PromiseResult) {
      if (result.status == 'fulfilled') records.push(...result.value)
    }
    return records
  }

  static async #findDocuments(collectionPath, ids) {
    if (!Array.isArray(ids) || lodash.isEmpty(ids)) return []

    if (ids.length > 10) {
      console.log('Should be maximum number of ids equal 10');
      return []
    }

    const collection = FirebaseHelper.mapCollection(
      await admin.firestore().collection(collectionPath).where('id', 'in', ids).get()
    )      
    return collection
  }

  /**
   * Maps collection documents.
   * Adds the ID and replaces timestamps to date.
   */
  static mapCollection(collection) {
    if (collection.empty) {
      return [];
    }

    const list = [];

    collection.forEach((document) => {
      const item = Object.assign({}, document.data(), {
        id: document.data().id || document.id,
      });

      this.replaceAllTimestampToDate(item);
      list.push(item);
    });

    return list;
  }

  /**
   * Maps a document.
   * Adds the ID and replaces timestamps to date.
   * @param {JSON} document
   * @returns {JSON|null}
   */
  static mapDocument(document) {
    if (!document.exists) {
      return null;
    }

    const item = Object.assign({}, document.data(), {
      id: document.data().id || document.id,
    });

    this.replaceAllTimestampToDate(item);

    return item;
  }

  static mapRecord(record) {
    if (!record) {
      return null;
    }

    // const item = record;
    this.replaceAllTimestampToDate(record);

    return record;
  }
 
  /**
   * Append Items To Array Fields
   * @param {String} collectionName The collection name of firestore
   * @param {String} id The document id of firestore
   * @param {FieldParameter[]} fields 
   * @param {Object} [options]
   * @param {JSON} options.currentUser
   * @param {Batch} options.batch
   * @param {String} options.language
   */
  static async appendItemsToArrayField(collectionName, id, fields, options) {
    //#region [ Validate ]
      if (!fields) return

      if (HelperFunctions.getTypeOfVariable(fields) != 'array') {
        throw new ErrorHandler({
          errorCode: 'INVALID_DATA_TYPE',
          message: 'The "fields" parameter must be an array', 
        })
      }

      fields.forEach((field, index) => {
        if (HelperFunctions.getTypeOfVariable(field) != 'object') {
          throw new ErrorHandler({
            errorCode: 'INVALID_DATA_TYPE',
            message: `The "fields[${index}]" must be a object`, 
          })
        }

        if (HelperFunctions.getTypeOfVariable(field.fieldName) != 'string') {
          throw new ErrorHandler({
            errorCode: 'INVALID_DATA_TYPE',
            message: `The "fields[${index}].fieldName" must be a string`, 
          })
        }

        if (HelperFunctions.getTypeOfVariable(field.fieldValues) != 'array') {
          throw new ErrorHandler({
            errorCode: 'INVALID_DATA_TYPE',
            message: `The "fields[${index}].fieldValues" must be an array`, 
          })
        }
      });
    //#endregion

    const record = {
      id,
      updatedBy: this.getCurrentUser(options).id,
      updatedAt: this.serverTimestamp(),
    };

    fields.forEach(field => {
      record[field.fieldName] = admin.firestore.FieldValue.arrayUnion(...field.fieldValues)
    })

    await this.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`${collectionName}/${id}`),
      record,
      options,
    );
  }

  /**
   * Edit Item In Array Field
   * @param {String} collectionName The collection name of firestore
   * @param {String} docId The document id of firestore
   * @param {String} fieldName The field name in document
   * @param {Int} fieldIndex The index of item in field array
   * @param {*} newValue 
   * @param {Object} [options]
   * @param {JSON} options.currentUser
   * @param {Batch} options.batch
   * @param {String} options.language
   * @returns 
   */
  static async editItemInArrayField(collectionName, docId, fieldName, fieldIndex, newValue, options) {
    try {
      //#region [ Validate ]
        if (!newValue) return 
  
        if (!collectionName) {
          throw new ErrorHandler({
            errorCode: 'INVALID_PARAMETER',
            message: 'The "collectionName" parameter is required', 
          })
        }
        if (!docId) {
          throw new ErrorHandler({
            errorCode: 'INVALID_PARAMETER',
            message: 'The "docId" parameter is required', 
          })
        }
        if (!fieldName) {
          throw new ErrorHandler({
            errorCode: 'INVALID_PARAMETER',
            message: 'The "fieldName" parameter is required', 
          })
        }
        if (!lodash.isInteger(fieldIndex) && fieldIndex >= 0) {
          throw new ErrorHandler({
            errorCode: 'INVALID_PARAMETER',
            message: 'The "fieldIndex" parameter is required', 
          })
        }
      //#endregion
  
      const document = await this.findDocument(collectionName, docId)
      const fieldArray = (document && document[fieldName]) || []
  
      if (fieldArray.length > fieldIndex) {
        fieldArray[fieldIndex] = newValue
        
        const record = {
          id: docId,
          [fieldName]: fieldArray,
          updatedBy: this.getCurrentUser(options).id,
          updatedAt: this.serverTimestamp(),
        };
  
        await this.executeOrAddToBatch(
          'update',
          admin.firestore().doc(`${collectionName}/${record.id}`),
          record,
          options,
        );
      } else {
        throw new ErrorHandler({
          errorCode: 'NOT_FOUND_ITEM',
          message: `This item "${fieldName}[${fieldIndex}]" does not exist, you can add it`, 
        })
      }
    } catch (error) {
      throw error      
    }
  }

  /**
   * Remove Items From Array Fields
   * @param {String} collectionName The collection name of firestore
   * @param {String} id The document id of firestore
   * @param {FieldParameter[]} fields 
   * @param {Object} [options]
   * @param {JSON} options.currentUser
   * @param {Batch} options.batch
   * @param {String} options.language
   */
  static async removeItemsFromArrayField(collectionName, id, fields, options) {
    //#region [ Validate ]
      if (!fields) return

      if (HelperFunctions.getTypeOfVariable(fields) != 'array') {
        throw new ErrorHandler({
          errorCode: 'INVALID_DATA_TYPE',
          message: 'The "fields" parameter must be an array', 
        })
      }

      fields.forEach((field, index) => {
        if (HelperFunctions.getTypeOfVariable(field) != 'object') {
          throw new ErrorHandler({
            errorCode: 'INVALID_DATA_TYPE',
            message: `The "fields[${index}]" must be a object`, 
          })
        }

        if (HelperFunctions.getTypeOfVariable(field.fieldName) != 'string') {
          throw new ErrorHandler({
            errorCode: 'INVALID_DATA_TYPE',
            message: `The "fields[${index}].fieldName" must be a string`, 
          })
        }

        if (HelperFunctions.getTypeOfVariable(field.fieldValues) != 'array') {
          throw new ErrorHandler({
            errorCode: 'INVALID_DATA_TYPE',
            message: `The "fields[${index}].fieldValues" must be an array`, 
          })
        }
      });
    //#endregion

    const record = {
      id,
      updatedBy: this.getCurrentUser(options).id,
      updatedAt: this.serverTimestamp(),
    };

    fields.forEach(field => {
      record[field.fieldName] = admin.firestore.FieldValue.arrayRemove(...field.fieldValues)
    })

    await this.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`${collectionName}/${id}`),
      record,
      options,
    );
  }

  /**
   * Generate firestore reference
   * @param {String} collectionName 
   * @param {*} filter 
   * @returns 
   */
  static _generateRef(collectionPath, filter = [], orderBy = '', sortBy = 'asc', queryType) {
    const FirestoreFilterHelper = require('./firestoreFilterHelper');
    console.log('Filter = ', filter);
    let ref = queryType === 'group' 
      ? admin.firestore().collectionGroup(collectionPath)
      : admin.firestore().collection(collectionPath);

    const response = FirestoreFilterHelper.applyFilter(ref, filter, orderBy, sortBy);
    // this.hasFilterConstraint = response.hasFilterConstraint
    // ref = response.ref || ref
    // return ref
    return {
      ref: response.ref || ref,
      hasFilterConstraint: !!response.hasFilterConstraint
    }
  }

  // /**
  //  * Generate firestore reference
  //  * @param {String} collectionName 
  //  * @param {*} filter 
  //  * @returns 
  //  */
  // static _generateRef(collectionPath, filter, sortBy = 'asc', orderBy = '') {
  //   console.log('Filter = ', filter);
  //   let ref = admin.firestore().collection(collectionPath)

  //   if ((Array.isArray(filter) && !filter.length) || !filter || Object.keys(filter).length === 0) {
  //     return !lodash.isEmpty(orderBy) && lodash.isString(orderBy)
  //       ? ref.orderBy(orderBy, sortBy)
  //       : ref
  //   }

  //   const orderByFieldsMandatory = [] 
  //   filter.forEach(el => {
  //     ref = ref.where(el.field, el.operator, el.value)
  //     if (el.operator === '!=' || el.operator === '<' || el.operator === '<=' || el.operator === '>' || el.operator === '>=') {
  //       orderByFieldsMandatory.push(el.field)
  //     }
  //   });

  //   if (!lodash.isEmpty(orderBy) && lodash.isString(orderBy) && !orderByFieldsMandatory.includes(orderBy)) {
  //     orderByFieldsMandatory.push(orderBy)
  //   }

  //   const uniqueOrderBy = [...new Set(orderByFieldsMandatory)]
  //   uniqueOrderBy.forEach(fieldName => {
  //     ref = ref.orderBy(fieldName, sortBy)
  //   });

  //   return ref
  // }

  static async count(collectionPath, filter) {
    let chain = admin.firestore().collection(collectionPath);

    if (filter) {
      Object.keys(filter).forEach((key) => {
        chain = chain.where(key, '==', filter[key]);
      });
    }

    return (await chain.get()).size;
  }

  /**
   * @param {Object} param 
   * @param {String} param.collectionPath 
   * @param {{ field: String, operator: String, value: any }[]} param.filter 
   * @param {String} param.orderBy 
   * @param {Object} param.pagination 
   * @param {Number} param.pagination.page 
   * @param {Number} param.pagination.offset 
   * @param {Number} param.pagination.limit 
   * @param {'asc'|'desc'} param.pagination.sortBy 
   * @param {'current'|'next'|'prev'} param.pagination.action 
   * @param {JSON} param.pagination.doc 
   * @param {'single'|'group'} param.queryType 
   * @returns 
   */
  static async listWithPagination({ collectionPath, filter, orderBy, pagination, queryType }) {
    try {
      const filters = filter || []
      const GROUP_TYPE = queryType || 'single'
      pagination = new Pagination().cast(pagination)
      let collection, paginationModel
  
      if (pagination && pagination.limit > 0) {
        const FirestorePaginationHelper = require('./firestorePaginationHelper');
        const FirestorePagination = new FirestorePaginationHelper({
          collectionName: collectionPath,
          pageSize: pagination.limit,
          field: orderBy,
          orderBy: orderBy,
          sortBy: pagination.sortBy,
          filter: filters,
          queryType: GROUP_TYPE
        })
          
        switch (pagination.action) {
          case 'next':
            collection = await (await FirestorePagination.nextPage(pagination)).get()
            break;
          case 'prev':
            collection = await (await FirestorePagination.prevPage(pagination)).get()
            break;
          case 'current':
            collection = await (await FirestorePagination.currentPage(pagination.page)).get()
            break;
          default:
            collection = await (await FirestorePagination.firstPage()).get()
            break;
        }
  
        paginationModel = await FirestorePagination.getPagination(
          this.mapCollection(collection)
        )
      } else {
        const SORT_BY = pagination.sortBy || 'asc'
        let { ref } = this._generateRef(collectionPath, filters, orderBy, SORT_BY, GROUP_TYPE)
        collection = await ref.get()
      }
      
      const all = this.mapCollection(collection);
      const rows = all
      const count = rows.length;
      
      return {
        rows,
        count,
        pagination: paginationModel ? paginationModel : { isFirstPage: true, isLastPage: true }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {String} collectionPath 
   * @param {{ field: String, operator: String, value: any }[]} filter 
   * @param {String} [orderBy] 
   * @param {'asc'|'desc'} [sortBy] 
   * @param {'single'|'group'} [queryType] 
   * @returns {Promise<JSON[]>}
   */
  static async listCollection(collectionPath, filter, orderBy, sortBy, queryType) {
    const filters = filter || []
    const SORT_BY = sortBy || 'asc'
    const GROUP_TYPE = queryType || 'single'

    let { ref } = this._generateRef(collectionPath, filters, orderBy, SORT_BY, GROUP_TYPE)
    const collection = this.mapCollection(
      await ref.get()
    );

    return collection
  }

  /**
   * Lists the Administrations autocomplete.
   * - See https://mongoosejs.com/docs/queries.html to learn how to customize the query.
   * @param {String} collectionPath
   * @param {String} fieldName
   * @param {String} search
   * @param {number} limit
   * @param {'en'|'ar'} [lang]
   */
  static async findAutocomplete(collectionPath, fieldName, search, limit, lang) {
    if (!search) {
      return []
    }

    const Field_Name = fieldName.includes('normalize') ? fieldName : `normalize_${fieldName}`
    const searchField = lang ? `${Field_Name}.${lang}` : Field_Name
    const searchText = HelperFunctions.stringNormalization(search)
    console.log({ searchField, searchText });

    const ref = admin.firestore().collection(collectionPath)
    const getQuery = () => {
      return lodash.isInteger(limit)
        ? ref.orderBy(searchField, 'asc').startAt(searchText).endAt(searchText + "\uf8ff").limit(limit)
        : ref.orderBy(searchField, 'asc').startAt(searchText).endAt(searchText + "\uf8ff")
    }

    const query = getQuery()
    const collection = FirebaseHelper.mapCollection(await query.get())
    return collection.map((record) => ({
      id: record.id,
      label: lang ? record[fieldName][lang] : record[fieldName],
    }));
  }

//#region [ This Functions For Relations ]  
  /**
   * In the case of a two way relationship, both records from both collections must be in sync.
   * This method ensures it for Many to One relations.
   *
   * @param {*} record
   * @param {*} sourceCollectionName
   * @param {*} sourceProperty
   * @param {*} targetCollectionName
   * @param {*} targetProperty
   * @param {*} options
   */
  static async refreshTwoWayRelationManyToOne(record, sourceCollectionName, sourceProperty, targetCollectionName, targetProperty, options) {
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
            !doc.get(sourceProperty).some((itemA) =>
              record[sourceProperty].some((itemB) => itemA === itemB)
            );

          if (currentRecord || notContainValue) {
            return;
          }

          const recordValuesRemoved = lodash.difference(
            doc.get(sourceProperty),
            record[sourceProperty],
          );

          await FirebaseHelper.executeOrAddToBatch(
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
          const isRelation = record[sourceProperty] && record[sourceProperty].includes(doc.id);

          if (isRelation) {
            await FirebaseHelper.executeOrAddToBatch(
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
              await FirebaseHelper.executeOrAddToBatch(
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
   * In the case of a two-way relationship, both records from both collections must be in sync.
   * This method ensures it for One to One relations.
   *
   * @param {*} record
   * @param {*} sourceProperty
   * @param {*} targetCollectionName
   * @param {*} targetProperty
   * @param {*} options
   */
  static async refreshTwoWayRelationOneToMany(record, sourceProperty, targetCollectionName, targetProperty, options) {
    async function addRelationToTarget() {
      if (!record[sourceProperty]) {
        return;
      }

      await FirebaseHelper.executeOrAddToBatch(
        'update',
        admin
          .firestore()
          .doc(
            `${targetCollectionName}/${record[sourceProperty]}`,
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

          await FirebaseHelper.executeOrAddToBatch(
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
   * In the case of a two-way relationship, both records from both collections must be in sync.
   * This method ensures it for Many to Many relations.
   *
   * @param {*} record
   * @param {*} sourceProperty
   * @param {*} targetCollectionName
   * @param {*} targetProperty
   * @param {*} options
   */
  static async refreshTwoWayRelationManyToMany(record, sourceProperty, targetCollectionName, targetProperty, options) {
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
          await FirebaseHelper.executeOrAddToBatch(
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
            await FirebaseHelper.executeOrAddToBatch('update', doc.ref, {
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
   * @param {*} recordId
   * @param {*} targetCollectionName
   * @param {*} targetProperty
   * @param {*} options
   */
  static async destroyRelationToMany(recordId, targetCollectionName, targetProperty, options) {
    const collection = await admin
      .firestore()
      .collection(targetCollectionName)
      .where(targetProperty, 'array-contains', recordId)
      .get();

    if (collection.empty) {
      return;
    }

    await FirebaseHelper.executeOrAddToBatch(
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
  static async destroyRelationToOne(recordId, targetCollectionName, targetProperty, options) {
    const collection = await admin
      .firestore()
      .collection(targetCollectionName)
      .where(targetProperty, '==', recordId)
      .get();

    if (collection.empty) {
      return;
    }

    await FirebaseHelper.executeOrAddToBatch(
      'update',
      collection.docs[0].ref,
      {
        [targetProperty]: null,
      },
      options,
    );
  }
//#endregion

};