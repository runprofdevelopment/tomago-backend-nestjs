const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const ErrorHandler = require('../../errors/errorHandler');
const Customer =
  new (require('../../database/models/customer'))();
const Address =
  new (require('../../database/models/address'))();

module.exports = class AddressEditor {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.customerId = null;
    this.repository = new FirestoreRepository(
      Address.collectionName,
    );
  }

  async update(customerId, id, data) {
    this.customerId = customerId || this.currentUser.id;

    try {
      await this._validate(id);
      data = this._preSave({ id, ...data });

      const existingRecord =
        await FirebaseHelper.findDocument(
          this.collectionPath,
          id,
        );

      // Check if the phone number is being changed
      if (
        data.phoneNumber &&
        data.phoneNumber !== existingRecord.phoneNumber
      ) {
        console.log('Phone number has been changed.');
        // existingRecord.phoneVerified = false;
        data.phoneVerified = false;
        // Add any additional logic for handling phone number changes here
      }

      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.updateDocument(
        id,
        data,
        {
          batch,
          currentUser: this.currentUser,
          language: this.language,
          collectionPath: this.collectionPath,
        },
      );
      await FirebaseHelper.commitBatch(batch);

      if (record.default) {
        const defaultAddresses = await admin
          .firestore()
          .collection(this.collectionPath)
          .where('default', '==', true)
          .get();
        defaultAddresses.forEach((doc) => {
          if (
            doc.id != record.id &&
            doc.data().id != record.id
          ) {
            doc.ref.update({ default: false });
          }
        });
      }

      return await FirebaseHelper.findDocument(
        this.collectionPath,
        id,
      );
    } catch (error) {
      throw error;
    }
  }

  _preSave(data) {
    const model = Address.cast(data);
    Object.keys(model).forEach((key) => {
      if (!(key in data)) delete model[key];
    });
    data = model;

    if (data && data.first_name) {
      data['normalize_first_name'] =
        HelperFunctions.stringNormalization(
          data.first_name,
        );
    }
    if (data && data.last_name) {
      data['normalize_last_name'] =
        HelperFunctions.stringNormalization(data.last_name);
    }
    if (data && data.name) {
      data['normalize_name'] =
        HelperFunctions.stringNormalization(data.name);
    }
    if (data && data.address) {
      data['normalize_address'] =
        HelperFunctions.stringNormalization(data.address);
    }
    if (data && data.country) {
      data['normalize_country'] =
        HelperFunctions.stringNormalization(data.country);
    }
    if (data && data.city) {
      data['normalize_city'] =
        HelperFunctions.stringNormalization(data.city);
    }

    return data;
  }

  async setDefaultAddress(customerId, addressId) {
    this.customerId = customerId || this.currentUser.id;

    try {
      // await this._validateEntityID();
      if (!addressId) {
        throw new ErrorHandler({
          errorCode: 'INVALID_INPUT',
          message: `"addressId" is required`,
        });
      }

      const defaultAddresses = await admin
        .firestore()
        .collection(this.collectionPath)
        .where('default', '==', true)
        .get();

      defaultAddresses.forEach((doc) =>
        doc.ref.update({ default: false }),
      );
      await admin
        .firestore()
        .collection(this.collectionPath)
        .doc(addressId)
        .update({ default: true });
    } catch (error) {
      throw error;
    }
  }

  async verifyPhoneNumber(customerId, addressId) {
    this.customerId = customerId || this.currentUser.id;

    try {
      const batch = await FirebaseHelper.createBatch();
      await this.repository.updateDocument(
        addressId,
        { phoneVerified: true },
        {
          batch,
          currentUser: this.currentUser,
          language: this.language,
          collectionPath: this.collectionPath,
        },
      );
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  get collectionPath() {
    const customer_id =
      this.customerId || this.currentUser.id;
    const collection_path = `${Customer.collectionName}/${customer_id}/${Address.collectionName}`;
    return collection_path;
  }

  async _validate(addressId) {
    const user = await FirebaseHelper.findDocument(
      Customer.collectionName,
      this.customerId,
    );
    if (!user) {
      throw new ErrorHandler({
        errorCode: 'NOT_FOUND',
        message: `There is no document related to this ID {"${this.customerId}"}`,
      });
    }

    const address = await FirebaseHelper.findDocument(
      this.collectionPath,
      addressId,
    );
    if (!address) {
      throw new ErrorHandler({
        errorCode: 'NOT_FOUND',
        message: `Address not found`,
      });
    }
  }
};
