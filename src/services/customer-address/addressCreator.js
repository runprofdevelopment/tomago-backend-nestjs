const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const ErrorHandler = require('../../errors/errorHandler');
const Customer = new (require('../../database/models/customer'));
const Address = new (require('../../database/models/address'));

module.exports = class AddressCreator {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.customerId = null;
    this.repository = new FirestoreRepository(Address.collectionName);
  }

  async create(customerId, data) {
    this.customerId = customerId || this.currentUser.id;

    try {
      data = await this._preSave(data);

      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language, 
        collectionPath: this.collectionPath,
      });
      await FirebaseHelper.commitBatch(batch);

      if (record.default) {
        const defaultAddresses = await admin.firestore().collection(this.collectionPath).where("default", "==", true).get();
        defaultAddresses.forEach(doc => {
          if (doc.id != record.id && doc.data().id != record.id) {
            doc.ref.update({ default: false })
          }
        });
      }

      const res = await FirebaseHelper.findDocument(this.collectionPath, record.id);
      return res;
    } catch (error) {
      throw error;
    }
  }

  async _preSave(data) {
    await this._validateCustomerID();
    data = Address.cast(data);

    if (data && data.phoneNumber && !data.phoneVerified) {
      data['phoneVerified'] = await this.checkPhoneIsVerifed(data.phoneNumber)
    }

    if (data && data.first_name) {
      data['normalize_first_name'] = HelperFunctions.stringNormalization(data.first_name);
    }
    if (data && data.last_name) {
      data['normalize_last_name'] = HelperFunctions.stringNormalization(data.last_name);
    }
    if (data && data.address) {
      if (data && data.name) {
        data['normalize_name'] = HelperFunctions.stringNormalization(data.name);
      }
      data['normalize_address'] = HelperFunctions.stringNormalization(data.address);
    }
    if (data && data.country) {
      data['normalize_country'] = HelperFunctions.stringNormalization(data.country);
    }
    if (data && data.city) {
      data['normalize_city'] = HelperFunctions.stringNormalization(data.city);
    }

    return data;
  }

  async checkPhoneIsVerifed(phoneNumber) {
    const verifedPhoneNumbers = FirebaseHelper.mapCollection(
      await admin.firestore().collection(this.collectionPath).where('phoneVerified', '==', true).get()
    ).map(address => address.phoneNumber);

    return verifedPhoneNumbers.includes(phoneNumber)
  }

  get collectionPath() {
    const customer_id = this.customerId || this.currentUser.id;
    const collection_path = `${Customer.collectionName}/${customer_id}/${Address.collectionName}`;
    return collection_path;
  }

  async _validateCustomerID() {
    const user = await FirebaseHelper.findDocument(Customer.collectionName, this.customerId);
    if (!user) {
      throw new ErrorHandler({
        errorCode: 'NOT_FOUND',
        message: `There is no document related to this ID {"${this.customerId}"}`
      })
    }
    if (user.isRemoved) {
      throw new ErrorHandler({
        errorCode: 'NOT_FOUND',
        message: `This user has been removed from the system`
      })
    }
  }
};