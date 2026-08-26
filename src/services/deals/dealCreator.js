const admin = require('firebase-admin');
const moment = require('moment');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const Deal = require('../../database/models/deal');

module.exports = class DealCreator {
  constructor(context) {
    this.ctx = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.model = new Deal();
    this.collectionName = this.model.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async execute(data) {
    try {
      await this._validate(data);
      data = this._preSave(data);

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

  _preSave(data) {
    data = {
      id: FirebaseHelper.newId(),
      ...this.model.cast(data),
      startDate: moment(data.startDate).format('YYYY-MM-DD').toString(),
      endDate: moment(data.endDate).format('YYYY-MM-DD').toString(),
    };

    if (data.name) {
      data['normalize_name'] = HelperFunctions.stringNormalization(data.name);
    }

    // const dateToStore = admin.firestore.Timestamp.fromDate(new Date('2024-08-15T00:00:00Z'));;
    // data.startDate = dateToStore;

    return data;
  }

  async _validate(data) {
    if (!data.name) throw new Error(`Deal Name is Required`);
    if (!data.startDate) throw new Error(`Start Date is Required`);
    if (!data.endDate) throw new Error(`End Date is Required`);
    if (!data.discountType) throw new Error(`Discount type is Required`);
    if (!data.discountAmount) throw new Error(`Discount amount is Required`);
    if (!data.currency) throw new Error(`currency is Required`);
    if (!data.ribbonName) throw new Error(`RibbonName is Required`);
    if (!data.ribbonColor) throw new Error(`Ribbon Color is Required`);
    if (!data.ribbonBackground) throw new Error(`Ribbon Background is Required`);

    const dateNow = moment().format('YYYY-MM-DD');
    if (data.startDate < dateNow) throw new Error(`Invalid "startDate", cannot start deal on this date ${moment(data.startDate).format('YYYY-MM-DD')}`);
    if (data.startDate >= data.endDate) {
      throw new Error(`The "Start Date: ${data.startDate}" must be earlier than the "End Date: ${data.endDate}" date. Please ensure that the selected Start Date is before the End Date.`);
    }

    if (data.discountType === 'percent' && (data.discountAmount > 100 || data.discountAmount <= 0)) {
      throw new Error('The deal amount must have % between 1 and 100');
    }
    if (data.discountType === 'fixed' && data.discountAmount <= 0) {
      throw new Error('The deal amount must have value more than 0');
    }

    if ('items' in data) {
      data.items.forEach((item, index) => {
        if (!item.productId) throw new Error(`productId of item #[${index+1}] is Required`);
        if (!item.variantId) throw new Error(`variantId of item #[${index+1}] is Required`);
        // if (!item.productId) throw new Error(`items[${index}].productId is Required`);
        // if (!item.variantId) throw new Error(`items[${index}].variantId is Required`);
      });
    }
  }
}