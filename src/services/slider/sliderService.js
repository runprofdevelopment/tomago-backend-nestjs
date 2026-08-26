const admin = require('firebase-admin');
const { Filter } = require('firebase-admin/firestore');
const { isArray } = require('lodash');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Slider = require('../../database/models/slider');
const AlgoliaService = require('./algoliaService');

module.exports = class SliderService {
  constructor({ currentUser, language }) {
    this.language = language;
    this.currentUser = currentUser;
    this.model = new Slider();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  /**
   * @param {JSON} data 
   * @param {'create'|'update'} action
   * @returns 
   */
  async _preSave(data, action) {
    if (action == 'create') {
      data = {
        ...this.model.cast(data),
        id: data.id || null,
      }
    } else if (action == 'update') {
      const model = this.model.cast(data)
      Object.keys(model).forEach(key => {
        if (!(key in data)) {
          delete model[key]
        }
      })
      data = model
    }

    return data;
  }

  /**
   * Create a new slider 
   * @param {JSON} data Slider data that you want to create
   * @returns {Promise<JSON>} Slider record
   */
  async create(data) {
    try {
      data = await this._preSave(data, 'create');
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch: batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      const algoliaInput = await this.findById(record.id)
      await AlgoliaService.addSliderToAlgolia(algoliaInput);
      return algoliaInput;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Edit an existing slider
   * @param {String} id Slider ID (Required)
   * @param {JSON} data Slider data that you want to update
   * @returns {Promise<JSON>} Slider record
   */
  async update(id, data) {
    try {
      // check this slider is new or not 
      const slider = await FirebaseHelper.findDocument(this.collectionName, id);
      if (!slider) return await this.create({ id, ...data });

      data = await this._preSave(data, 'update');
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);
      await AlgoliaService.updateSliderInAlgolia(id, data);
      return this.findById(record.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Permanently delete slider by ID (Force delete)
   * @param {String} id Slider ID (Required) 
   */
  async destroy(id) {
    try {
      const batch = await FirebaseHelper.createBatch();
      await this.repository.destroyDocument(id, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await AlgoliaService.deleteSliderFromAlgolia(id);
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete sliders
   * @param {String[]} ids sliders Ids (Required) 
   */
  async destroyAll(ids) {
    try {
      const batch = await FirebaseHelper.createBatch();
      for (const id of ids) {
        await this.repository.destroyDocument(id, {
          batch,
          currentUser: this.currentUser,
          language: this.language,
        });
        await AlgoliaService.deleteSliderFromAlgolia(id);
      }
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  //#region [ Functions For Reading Documents ]
  async findById(id) {
    const record = await this.repository.findDocumentById(id);
    // return await this.populate(record);
    return record
  }

  /**
   * @param {Object} args 
   * @param {JSON} args.filter 
   * @param {String} args.orderBy 
   * @param {Object} args.pagination
   * @param {Number} args.pagination.page
   * @param {Number} args.pagination.offset
   * @param {JSON} args.pagination.doc
   * @param {Number} args.pagination.limit
   * @param {'asc'|'desc'} args.pagination.sortBy
   * @param {'current'|'next'|'prev'} args.pagination.action
   * @returns {Promise}
   */
  async listWithPagination(args) {
    args['filter'] = args.filter || []
    args['filter'].push({ field: 'accountType', operator: 'in', value: ['admin', 'owner'] });

    const response = await this.repository.listCollection(args);
    response.rows = await this.populateAll(response.rows); // Find Relations
    return response
  }

  async list() {
    const records = FirebaseHelper.mapCollection(
      await admin.firestore().collection(this.collectionName)
        .orderBy('createdAt', 'desc')
        .get()
    );
    return this._mapRecords(records);
    // return await this.populateAll(records);
  }

  async listActiveSliders() {
    const CURRENT_DATE = new Date();
    const records = FirebaseHelper.mapCollection(
      await admin.firestore().collection(this.collectionName)
        .where(
          Filter.or(
            Filter.where('endDate', '==', null),
            Filter.where('endDate', '>', CURRENT_DATE),
          )
        )
        .get()
    );
    return this._mapRecords(records);
    // return await this.populateAll(records);
  }

  _mapRecords(records) {
    const data = records && isArray(records) ? records : [];

    return {
      rows: data,
      count: data.length,
      pagination: {
        isFirstPage: true,
        isLastPage: true,
      },
    }
  }

  /**
   * Populates the records with all its relations.
   * @param {*} records
   */
  async populateAll(records) {
    return await Promise.all(
      records.map((record) => this.populate(record)),
    );
  }

  /**
   * Populates the record with all its relations.
   * @param {*} record
   */
  async populate(record) {
    if (!record) {
      return record;
    }

    record.imageEn = (record.imageEn && record.imageEn.publicUrl) || null;
    record.imageAr = (record.imageAr && record.imageAr.publicUrl) || null;

    return record;
  }
  //#endregion
};