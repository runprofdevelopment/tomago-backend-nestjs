const assert = require('assert');
const Roles = require('../../security/roles');
const ValidationError = require('../../errors/validationError');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const UserRepository = require('../../database/repositories/userRepository');
const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');

module.exports = class IamDestroyer {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    
    this.batch = null;
    this.ids = [];
  }

  async deleteMyAccount() {
    try {
      assert(this.currentUser, 'currentUser is required');
      assert(this.currentUser.id, 'currentUser.id is required');
      
      const id = this.currentUser.id;
      const uid = this.currentUser && this.currentUser.authenticationUid;

      const batch = await FirebaseHelper.createBatch();
      // [1] Delete the user from the firestore collection
      await UserRepository.destroy(id, {
        currentUser: this.currentUser,
        batch: batch,
      })
      
      // [2] Disable the user in firebase authentication
      await AuthFirebaseService.disable(uid);
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Permanently delete user item by ID (Force delete)
   * @param {String} id User ID (Required) 
   */
  async destroy(id) {
    this.ids = id ? [id] : [];

    try {
      await this._validate();
      const user = await this._loadUser(id);
      const uid = user && user.authenticationUid;

      const batch = await FirebaseHelper.createBatch();
      // [1] Delete the user from the firestore collection
      await UserRepository.destroy(id, {
        currentUser: this.currentUser,
        batch: batch,
      })
      
      // [2] Disable the user in firebase authentication
      await AuthFirebaseService.disable(uid);
      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async destroyAll(ids) {
    this.ids = ids || [];

    try {
      await this._validate();
      const users = await this._loadUsers(ids);

      const batch = await FirebaseHelper.createBatch();

      for (const user of users) {
        const id = user.id;
        const uid = user.authenticationUid;

        // [1] Delete the user from the firestore collection
        await UserRepository.destroy(id, {
          batch,
          currentUser: this.currentUser,
        });

        // [2] Disable the user in firebase authentication
        await AuthFirebaseService.disable(uid);
      }

      await FirebaseHelper.commitBatch(batch);
    } catch (error) {
      throw error;
    }
  }

  async _loadUser(id) {
    const user = await UserRepository.findById(id);

    if (!user) {
      throw new ValidationError(this.language, 'iam.errors.userNotFound');
    }

    return user;
  }

  async _loadUsers(ids) {
    const users = await Promise.all(
      ids.map(id => UserRepository.findById(id))
    );
    return users.filter(user => user);
  }

  get _roles() {
    if (this.data.roles && !Array.isArray(this.data.roles)) {
      return [this.data.roles];
    } else {
      const uniqueRoles = [...new Set(this.data.roles)];
      return uniqueRoles;
    }
  }

  async _isRemovingOwnOwnerRole() {
    if (!this.ids.includes(this.currentUser.id)) {
      return false;
    }

    const currentUserRoles = await UserRepository.findUserRoles(this.currentUser.id);
    return currentUserRoles.includes(Roles.values.owner);
  }

  /** Checks if the user is removing himself */
  _isRemovingHimself() {
    return this.ids.includes(this.currentUser.id);
  }

  async _validate() {
    assert(this.currentUser, 'currentUser is required');
    assert(this.currentUser.id, 'currentUser.id is required');
    assert(this.currentUser.email, 'currentUser.email is required');
    assert(this.ids, 'id(s) is required');
    // assert(this._roles, 'roles is required (can be empty)');

    if (this._isRemovingHimself()) {
      throw new ValidationError(this.language, 'iam.errors.destroyingHimself');
    }
    // if (await this._isRemovingOwnOwnerRole()) {
    //   throw new ValidationError(this.language, 'iam.errors.revokingOwnPermission');
    // }
  }
};