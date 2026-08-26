const admin = require('firebase-admin');
const lodash = require('lodash');

/**
 * Abstracts some basic Firestore operations.
 * See https://firebase.google.com/docs/firestore
 */
module.exports = class AbstractRepository {
  /** Cleans the database. */
  static async cleanDatabase() {
    throw new Error('Not implemented');
  }

  /** Creates a new Firestore ID. */
  static newId() {
    return admin
      .firestore()
      .collection(`ids`)
      .doc().id;
  }

  /** Creates a server timestamp. */
  static serverTimestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  /**
   * Finds a document relation. Collection or Doc.
   *
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
   *
   * @param {*} collectionName
   * @param {*} id
   */
  static async findDocument(collectionName, id) {
    return this.mapDocument(
      await admin
        .firestore()
        .doc(`${collectionName}/${id}`)
        .get(),
    );
  }

  /**
   * Finds several documents.
   *
   * @param {*} collectionName
   * @param {*} ids
   */
  static async findDocuments(collectionName, ids) {
    return Promise.all(
      ids.map((id) =>
        this.findDocument(collectionName, id),
      ),
    );
  }

  /**
   * Returns the currentUser if it exists on the options.
   *
   * @param {object} options
   */
  static getCurrentUser(options) {
    return (options && options.currentUser) || { id: null };
  }

  /**
   * Returns the current batch if it exists on the options.
   *
   * @param {object} options
   */
  static getBatch(options) {
    return (options && options.batch) || undefined;
  }

  /**
   * Creates a Firestore Batch.
   */
  static async createBatch() {
    return admin.firestore().batch();
  }

  /**
   * Commits the current batch.
   */
  static async commitBatch(batch) {
    return batch.commit();
  }

  /**
   * Executes if no batch is informed.
   * Adds to the batch if it exists.
   */
  static async executeOrAddToBatch(
    operation,
    document,
    data,
    options,
  ) {
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

  /**
   * Replaces all Firestore timestamps to Date.
   */
  static replaceAllTimestampToDate(arg) {
    if (!arg) {
      return arg;
    }

    // Object.keys(arg).forEach((key) => {
    //   if (arg[key] && arg[key] instanceof admin.firestore.Timestamp) {
    //     // admin.firestore.Timestamp.now().toDate()
    //     // console.log('KEY = ', key);
    //     // console.log('toMillis ==>', new Date(arg[key].toDate()).toLocaleString("en-us"));
    //     // const d1 = moment(arg[key].toDate()).locale("en-us").format("D MMM, YYYY hh:mm:ss")
    //     // console.log(`${key} ==>`, d1);
    //     // console.log(new Date(d1));
    //     // console.log('toMillis ==>', Date(arg[key]));
    //     // arg[key] = new Date(arg[key].toMillis()).toLocaleString("en-us")
    //     arg[key] = arg[key].toDate()
    //   }
    // });

    Object.keys(arg).forEach((key) => {
      if (
        arg[key] &&
        arg[key] instanceof admin.firestore.Timestamp
      ) {
        // console.log(arg[key]);
        // console.log('new Date',new Date(arg[key].seconds * 1000));
        // arg[key] = arg[key].toDate();
        arg[key] = new Date(arg[key].seconds * 1000 + arg[key].nanoseconds / 1000000)
        // arg[key] = new Date(arg[key].seconds * 1000)
        // arg[key].setHours(arg[key].getHours() + TIME_ZONE_HOURS);
        // arg[key].setHours(arg[key].getHours())
        // arg[key] = new Date(arg[key])
        // console.log(new Date(arg[key]));
      }
    });
  }

  /**
   * Converts the value to Firestore Timestamp if it's not.
   *
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
        // console.log("TIME_ZONE_HOURS ==> ", TIME_ZONE_HOURS);

        // const dateTime = value.setHours(value.getHours() - TIME_ZONE_HOURS)
        const date = new Date(value)
        return admin.firestore.Timestamp.fromDate(date);
        // return admin.firestore.Timestamp.fromDate(value);
      }

      throw new Error(`Error adding audition fields!`);
    }

    return value;
  }

  getCurrentUser(options) {
    return AbstractRepository.getCurrentUser(options);
  }

  getBatch(options) {
    return AbstractRepository.getBatch(options);
  }

  async createBatch() {
    return AbstractRepository.createBatch();
  }

  async commitBatch(batch) {
    return AbstractRepository.commitBatch(batch);
  }

  async executeOrAddToBatch(
    operation,
    document,
    data,
    options,
  ) {
    return AbstractRepository.executeOrAddToBatch(
      operation,
      document,
      data,
      options,
    );
  }

  mapDocument(document) {
    return AbstractRepository.mapDocument(document);
  }

  mapCollection(collection) {
    return AbstractRepository.mapCollection(collection);
  }

  newId() {
    return AbstractRepository.newId();
  }

  async findRelation(collectionName, value) {
    return AbstractRepository.findRelation(
      collectionName,
      value,
    );
  }

  findDocument(collectionName, id) {
    return AbstractRepository.findDocument(
      collectionName,
      id,
    );
  }

  findDocuments(collectionName, ids) {
    return AbstractRepository.findDocuments(
      collectionName,
      ids,
    );
  }

  serverTimestamp() {
    return AbstractRepository.serverTimestamp();
  }
};
