const assert = require('assert');
const Roles = require('../../security/roles');
const ValidationError = require('../../errors/validationError');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const UserRepository = require('../../database/repositories/userRepository');
const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');

module.exports = class IamEditor {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    
    this.data = null;
    this.batch = null;
    this.user = null;
  }

  async update(data) {
    this.data = data;
    await this._validate();

    try {
      this.batch = await FirebaseHelper.createBatch();

      await this._loadUser();
      await this._updateAtDatabase();

      await FirebaseHelper.commitBatch(this.batch);
    } catch (error) {
      throw error;
    }

    await this._updateAtAuthentication();
  }

  get _roles() {
    if (this.data.roles && !Array.isArray(this.data.roles)) {
      return [this.data.roles];
    } else {
      const uniqueRoles = [...new Set(this.data.roles)];
      return uniqueRoles;
    }
  }

  async _loadUser() {
    this.user = await UserRepository.findById(this.data.id);

    if (!this.user) {
      throw new ValidationError(this.language, 'iam.errors.userNotFound');
    }
  }

  async _updateAtDatabase() {
    this.user = await UserRepository.update(this.data.id, this.data, {
        currentUser: this.currentUser,
        batch: this.batch,
        modelType: null,
      },
    );
  }

  async _updateAtAuthentication() {
    const uid = this.user.authenticationUid;
    if (uid) {
      await AuthFirebaseService.updateUser(uid, this.user);
    }
  }

  async _isRemovingOwnOwnerRole() {
    if (this._roles.includes(Roles.values.owner)) {
      return false;
    }

    if (this.data.id !== this.currentUser.id) {
      return false;
    }

    const currentUserRoles = await UserRepository.findUserRoles(this.currentUser.id);
    return currentUserRoles.includes(Roles.values.owner);
  }

  async _validate() {
    assert(this.currentUser, 'currentUser is required');
    assert(this.currentUser.id, 'currentUser.id is required');
    assert(this.currentUser.email, 'currentUser.email is required');
    assert(this.data.id, 'id is required');
    assert(this._roles, 'roles is required (can be empty)');

    if (await this._isRemovingOwnOwnerRole()) {
      throw new ValidationError(this.language, 'iam.errors.revokingOwnPermission');
    }
  }
};