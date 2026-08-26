// const admin = require('firebase-admin');
const moment = require('moment');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const Deal = require('../../database/models/deal');
const HelperFunctions = require('../../utils/helperFunctions');

module.exports = class DealEditor {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Deal();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async execute(id, data) {
    this.id = id;

    try {
      await this._loadDeal();
      await this._validate(data);
      data = this._preSave(data);

      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(id, data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);

      return this.repository.findDocumentById(id);
    } catch (error) {
      throw error;
    }
  }

  async _loadDeal() {
    this.deal = await FirebaseHelper.findDocument(this.collectionName, this.id);

    if (!this.deal) {
      throw new Error('Deal not found');
    }
  }

  _preSave(data) {
    const model = this.model.cast(data)
    Object.keys(model).forEach((key) => {
      if (!(key in data)) delete model[key];
    })
    data = model;

    if (data.startDate) {
      data['startDate'] = moment(data.startDate).format('YYYY-MM-DD').toString();
    }
    if (data.endDate) {
      data['endDate'] = moment(data.endDate).format('YYYY-MM-DD').toString();
    }
    if (data.name) {
      data['normalize_name'] = HelperFunctions.stringNormalization(data.name);
    }

    return data;
  }

  async _validate(data) {
    if ('name' in data && !data.name) throw new Error(`Deal Name is Required`);
    if ('startDate' in data && !data.startDate) throw new Error(`Start Date is Required`);
    if ('endDate' in data && !data.endDate) throw new Error(`End Date is Required`);
    if ('discountType' in data && !data.discountType) throw new Error(`Discount type is Required`);
    if ('discountAmount' in data && !data.discountAmount) throw new Error(`Discount amount is Required`);
    if ('currency' in data && !data.currency) throw new Error(`currency is Required`);
    if ('ribbonName' in data && !data.ribbonName) throw new Error(`RibbonName is Required`);
    if ('ribbonColor' in data && !data.ribbonColor) throw new Error(`Ribbon Color is Required`);
    if ('ribbonBackground' in data && !data.ribbonBackground) throw new Error(`Ribbon Background is Required`);

    if ('startDate' in data) {
      const dateNow = moment().format('YYYY-MM-DD');
      if (data.startDate < dateNow) throw new Error(`Invalid "startDate", cannot start deal on this date ${moment(data.startDate).format('YYYY-MM-DD')}`);
    }

    const startDate = data.startDate || this.deal.startDate;
    const endDate = data.endDate || this.deal.endDate;
    if (startDate >= endDate) {
      throw new Error(`The "Start Date: ${startDate}" must be earlier than the "End Date: ${endDate}" date. Please ensure that the selected Start Date is before the End Date.`);
    }

    if ('discountType' in data) {
      const discountType = data.discountType || this.deal.discountType;
      const discountAmount = data.discountAmount || this.deal.discountAmount;

      if (discountType === 'percent' && (discountAmount > 100 || discountAmount <= 0)) {
        throw new Error('The deal amount must be a percentage between 1 and 100 because the discount type is set to percent');
      }
      if (discountType === 'fixed' && discountAmount <= 0) {
        throw new Error('The deal amount must have value more than 0');
      }
    }
    
    if ('items' in data) {
      data.items.forEach((item, index) => {
        if (!item.productId) throw new Error(`productId of item #[${index+1}] is Required`);
        if (!item.variantId) throw new Error(`variantId of item #[${index+1}] is Required`);
      });
    }
  }
}