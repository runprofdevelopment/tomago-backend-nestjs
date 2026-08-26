// const { i18n } = require('../../i18n');
const admin = require('firebase-admin');
const moment = require('moment');
const validator = require('validator');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const HelperFunctions = require('../../utils/helperFunctions');
const EmailService = require('../emails/emailService');
const Customer = new (require('../../database/models/customer'));

module.exports = class CustomerCreator {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.collectionName = Customer.collectionName;
    this.repository = new FirestoreRepository(this.collectionName);
  }

  async execute(data) {
    try {
      await this._validate(data);

      data = await this._preSave(data);
      
      // Use the Firebase Auth UID as the document ID
      data.id = this.currentUser.authenticationUid;
      
      const batch = await FirebaseHelper.createBatch();
      const record = await this.repository.createDocument(data, {
        batch,
        currentUser: this.currentUser,
        language: this.language,
      });
      await FirebaseHelper.commitBatch(batch);

      // Note: Automatic email verification has been removed
      // Users can manually request email verification when needed
      console.log('Customer account created - email verification is now manual only');

      return await this.repository.findDocumentById(record.id);
    } catch (error) {
      throw error;
    }
  }

  // async sendEmails(data) {
  //   const allowed_providers = ['password', 'facebook', 'apple'];

  //   if (data.email) {
  //     await EmailService.sendWelcomeEmail(this.language, data.email, data.fullName);
  //     console.log(`Send Welcome Email at: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  //   }

  //   if (data.email && !data.emailVerified && allowed_providers.includes(data.providerId)) {
  //     setTimeout(async() => {
  //       await EmailService.sendEmailAddressVerification(data.email, this.language, this.currentUser);
  //     }, 5000);
  //   }
  // }

  _preSave(data) {
    data = {
      ...Customer.cast(data),
      // id: `${FirebaseHelper.newIdNumber()}`,
      roles: ['customer'],
    };

    data.firstName = data.firstName 
      ? data.firstName.trim() 
      : data.email ? data.email.split('@')[0] : null;

    data.lastName = data.lastName ? data.lastName.trim() : null;
  
    if (data.firstName || data.lastName) {
      data.fullName = `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim();
    }
    
    data = this._normalizeFields(data);
    return data;
  }

  _normalizeFields(data) {
    if (!data) return data;

    if (data.firstName) {
      data['normalize_firstName'] = HelperFunctions.stringNormalization(data.firstName)
    }
    if (data.lastName) {
      data['normalize_lastName'] = HelperFunctions.stringNormalization(data.lastName)
    }
    if (data.fullName) {
      data['normalize_fullName'] = HelperFunctions.stringNormalization(data.fullName)
    }

    return data;
  }

  async _validate(data) {
    data = { ...this.currentUser, ...data };
    const email = this.currentUser.email || null;

    if (!data.firstName) throw new Error('firstName is required');
    if (!data.lastName) throw new Error('lastName is required');
    if (email && !validator.isEmail(email)) throw new Error('Invalid email format');

    const { exists, providedBy, providerValue } = await this._verifyUserExists(data);
    if (exists) {
      throw new Error(`The provided ${providedBy} ${providerValue} is already in use by an existing user. Please try another ${providedBy}.`);
      // throw new Error(i18n(this.language, 'iam.errors.userAlreadyExists', email));
      // throw new Error(`The provided email ${email} is already in use by an existing user`);
      // throw new Error(`The provided email ${email} is already in use by an existing user. Each user must have a unique email.`);
    }
  }

  async _verifyUserExists(data) {
    const collectionRef = admin.firestore().collection(this.collectionName);
    let query = collectionRef
      // .where('deleted', '==', false)
      // .where('providerId', '==', data.providerId)
      // .where('email', '==', data.email);
      // .where('providerId', '==', data.providerId);

    let providedBy = null, providerValue = null, isSuccessQuery = true;
    if (
      data.providerId === 'google' || 
      data.providerId === 'password' || 
      (data.providerId === 'facebook' && data.email) ||
      (data.providerId === 'apple' && data.email)
    ) {
      providedBy = 'email'; 
      providerValue = data.email;
      query = query.where('providerId', 'in', [ 'password', 'google', 'facebook', 'apple' ])
        .where('email', '==', data.email);
    } 
    else if (data.providerId === 'phone' || (data.providerId === 'facebook' && data.phoneNumber)) {
      providedBy = 'phone';
      providerValue = data.country_code + data.phoneNumber;
      query = query.where('providerId', '==', data.providerId)
        .where('phoneNumber', '==', data.phoneNumber)
        // .where('country_code', '==', data.country_code);
    } else {
      isSuccessQuery = false;
    }

    const snapshot = await query.count().get();

    const exists = (snapshot.data().count) > 0 && isSuccessQuery;

    // if (exists && ['facebook', 'apple'].includes(data.providerId) && !data.emailVerified) {
    //   throw new Error('Email is already in use. Please try another email.');
    // }

    return { exists, providedBy, providerValue };
  }
};