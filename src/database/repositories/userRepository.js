const lodash = require('lodash');
const admin = require('firebase-admin');
const crypto = require('crypto');
const HelperFunctions = require('../../utils/helperFunctions');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const AuditLogRepository = require('./auditLogRepository');
const FirebaseQuery = require('../../database/utils/firebaseQuery');
const FirestoreRepository = require('./firestoreRepository');
const User = require('../models/user');
const Customer = require('../models/customer');

/** Handles database operations for Users. */
module.exports = class UserRepository {
  static get EMPTY_USER() {
    return new User().cast({});
  }

  static get EMPTY_CUSTOMER() {
    return new Customer().cast({});
  }

  static getUserModel(accountType) {
    return accountType === 'customer'
      ? new Customer() 
      : new User();
  }

  /**
   * Generates a new ID based on the email (unique).
   * @param {*} data
   */
  static generateId(data) {
    if (!data || !data.email) {
      return FirebaseHelper.newId();
    }
    return crypto.createHash('md5').update(data.email).digest("hex");
  }

  static verifyUserRole(user, role) {
    if (!user || !user.roles || !user.roles.length) {
      return false
    }

    return user.roles.includes(role)
  }

  static verifyUserType(user, accountType) {
    if (!user || !user.accountType) {
      return false
    }

    return user.accountType === accountType
  }

  /** Normalize the user fields. */
  static _preSave(data, modelType) {
    // if (!data) return data;
    const isCustomer = modelType === 'customer' || data.accountType === 'customer';

    data = isCustomer
      ? new Customer().cast(data) 
      : new User().cast(data);
    
    if (isCustomer) data['roles'] = ['customer'];

    if (data.email) data.email = data.email.trim();

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

  static async _preSaveingUpdates(data, modelType) {
    if (!data) return data;

    const model = (modelType == 'customer') ? new Customer().cast(data) : new User().cast(data);
    Object.keys(model).forEach(key => {
      if (!(key in data)) delete model[key];
    });
    data = model;

    if (data.email) {
      data.email = data.email.trim();
    }
    if (data.firstName) {
      data.firstName = data.firstName.trim();
    }
    if (data.lastName) {
      data.lastName = data.lastName.trim();
    }
    if (data.firstName || data.lastName) {
      const User = await this.findById(data.id);
      const oldFirstName = User && User.firstName;
      const oldLastName = User && User.lastName;
      data.fullName = `${(data.firstName || oldFirstName || '').trim()} ${(data.lastName || oldLastName || '').trim()}`.trim();
    }
    
    data = this._normalizeFields(data);
    return data;
  }

  static _normalizeFields(data) {
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

  static async create(data, { currentUser, batch, modelType }) {
    const options = { currentUser, batch, modelType };

    data = this._preSave(data, modelType);
    const user = {
      id: data.id || this.generateId(data),
      ...data,
      createdBy: FirebaseHelper.getCurrentUser(options).id || data.id || null,
      createdAt: FirebaseHelper.serverTimestamp(),
      updatedBy: FirebaseHelper.getCurrentUser(options).id || data.id || null,
      updatedAt: FirebaseHelper.serverTimestamp(),
      deletedAt: null,
      deletedBy: null,
    };

    await FirebaseHelper.executeOrAddToBatch(
      'set',
      admin.firestore().doc(`user/${user.id}`),
      user,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.CREATE,
      user.id,
      user,
      options,
    );

    return user;
  }

  static async update(id, data, { currentUser, batch, modelType }) {
    const options = { currentUser, batch, modelType };

    data = await this._preSaveingUpdates(data, modelType);
    const user = {
      id,
      ...data,
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
    };

    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`user/${id}`),
      user,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.UPDATE,
      id,
      user,
      options,
    );
    return await this.findById(user.id)
  }

  static async updateProfile(id, data, { currentUser, batch, modelType }) {
    const options = { currentUser, batch, modelType };

    data = await this._preSaveingUpdates(data, modelType);
    const user = {
      id,
      ...data,
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
    };

    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`user/${id}`),
      user,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.UPDATE,
      id,
      user,
      options,
    );

    return user;
  }

  static async updateAuthenticationUid(id, authenticationUid, options) {
    const user = {
      id,
      authenticationUid,
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
    };

    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`user/${user.id}`),
      user,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.UPDATE,
      id,
      user,
      options,
    );
    
    // return await this.findById(id);
    return user;
  }

  static async updateStatus(id, disabled, options) {
    const user = {
      id,
      disabled,
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
    };

    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`user/${user.id}`),
      user,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.UPDATE,
      id,
      user,
      options,
    );

    return user;
  }

  static async updateRoles(id, roles, options) {
    const user = await this.findById(id);

    if (options.addRoles) {
      user.roles = [...user.roles, ...roles];
    } else if (options.removeOnlyInformedRoles) {
      user.roles = lodash.difference(user.roles, roles);
    } else {
      user.roles = roles;
    }

    const data = { roles: user.roles };
    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`user/${id}`),
      data,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.UPDATE,
      user.id,
      data,
      options,
    );

    return user;
  }

  static async destroy(id, { currentUser, batch }) {
    const options = { currentUser, batch };
    const record = {
      deletedAt: FirebaseHelper.serverTimestamp(),
      deletedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedBy: FirebaseHelper.getCurrentUser(options).id,
      updatedAt: FirebaseHelper.serverTimestamp(),
    };

    await FirebaseHelper.executeOrAddToBatch(
      'update',
      admin.firestore().doc(`${new User().collectionName}/${id}`),
      record,
      options,
    );

    await this._auditLogs(
      AuditLogRepository.DELETE,
      id,
      record,
      options
    );
    // await this.destroyFromRelations(id, options);
  }

  /**
   * Creates an audit log of the operation.
   * @param {string} action - The action [create, update or delete].
   * @param {object} id - The record id
   * @param {object} data - The new data passed on the request
   * @param {object} options
   */
  static async _auditLogs(action, id, data, options) {
    await AuditLogRepository.log({
      entityName: new User().modelName || 'user',
      entityId: id,
      action,
      values: data,
    }, options);
  }

//#region [ Queries ]  
  static async findById(id, options = {}) {
    const record = await FirebaseHelper.findDocument('user', id, options);
    return record
  }

  /**
   * Find user by uid
   * @param {String} uid The Authentication Uid
   * @returns {Promise<JSON|null>}
   */
  static async findByAuthenticationUid(uid, options = {}) {
    const users = FirebaseHelper.mapCollection(
      await admin.firestore().collection(`user`)
        .where('authenticationUid', '==', uid)
        .limit(1)
        .get()
    );

    if (users.length > 0) {
      const user = users[0];
      if (!options.includeDeleted && FirebaseHelper.isSoftDeleted(user)) {
        return null;
      }
      return user;
    }

    return null;
  }

  /**
   * Find user by email
   * @param {String} email 
   * @returns {Promise<JSON|null>}
   */
  static async findByEmail(email, options = {}) {
    if (!email) return null

    const users = FirebaseHelper.mapCollection(
      await admin.firestore().collection(`user`)
        .where('email', '==', email)
        .limit(1)
        .get()
    );

    if (users.length) {
      const user = users[0];
      if (!options.includeDeleted && FirebaseHelper.isSoftDeleted(user)) {
        return null;
      }
      return user;
    }

    return null;
  }

  /**
   * Find user by phone number
   * @param {String} phoneNumber 
   * @returns {Promise<JSON|null>}
   */
  static async findByPhoneNumber(phoneNumber, options = {}) {
    if (!phoneNumber) return null

    const users = FirebaseHelper.mapCollection(
      await admin.firestore().collection(`user`)
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get()
    );

    if (users.length) {
      const user = users[0];
      if (!options.includeDeleted && FirebaseHelper.isSoftDeleted(user)) {
        return null;
      }
      return user;
    }

    return null;
  }

  static async findByEmailOrPhone(email, phoneNumber, options = {}) {
    const user = await this.findByEmail(email, options) || await this.findByPhoneNumber(phoneNumber, options)
    return user;
  }

  static async findAllByDisabled(ids, disabled) {
    const users = await FirebaseHelper.findDocuments('user', ids);
    return users.filter(user => !!user.disabled === !!disabled);
  }

  static async count(filter) {
    let chain = admin.firestore().collection('user');

    if (filter) {
      Object.keys(filter).forEach((key) => {
        chain = chain.where(key, '==', filter[key]);
      });
    }

    return (await chain.get()).size;
  }

  static async findAllWithUsers({ filter, orderBy }) {
    const users = FirebaseHelper.filterSoftDeletedRecords(
      FirebaseHelper.mapCollection(
        await admin
          .firestore()
          .collection(`user`)
          .get(),
      )
    );
  
    const roles = [
      ...new Set(
        lodash.flatMap(users.map((user) => user.roles)),
      ),
    ];
  
    if (orderBy) {
      const [column, order] = orderBy.split('_');
      if (order === 'ASC') {
        roles.sort((a, b) => a.localeCompare(b));
      } else {
        roles.sort((a, b) => b.localeCompare(a));
      }
    }
  
    return roles.map((role) => ({
      role,
      users: users.filter((user) =>
        user.roles.includes(role),
      ),
    }));
  }
  
  static async findAllUsersByRole(role) {
    const users = FirebaseHelper.filterSoftDeletedRecords(
      FirebaseHelper.mapCollection(
        await admin.firestore().collection(`user`)
          .where('roles', 'array-contains', role)
          .get(),
      )
    );
  
    return users;
  }
  
  static async findUserRoles(userId) {
    const user = await admin.firestore().doc(`user/${userId}`).get();
    return user.get('roles');
  }
//#endregion
};