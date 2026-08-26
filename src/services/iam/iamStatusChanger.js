const assert = require('assert');
const ValidationError = require('../../errors/validationError');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const UserRepository = require('../../database/repositories/userRepository');
const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');

module.exports = class IamStatusChanger {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.batch = null;
  }

  async changeStatus(data) {
    this.data = data;
    await this._validate();
    
    try {
      this.batch = await FirebaseHelper.createBatch();
      await this._loadUsers();
      await this._changeAtDatabase();
      await FirebaseHelper.commitBatch(this.batch);
    } catch (error) {
      throw error;
    }

    await this._changeAtAuthentication();
  }

  get _ids() {
    if (this.data.ids && !Array.isArray(this.data.ids)) {
      return [this.data.ids];
    } else {
      const uniqueIds = [...new Set(this.data.ids)];
      return uniqueIds;
    }
  }

  get _disabled() {
    return !!this.data.disabled;
  }

  async _loadUsers() {
    this.users = await UserRepository.findAllByDisabled(this._ids, !this._disabled);
  }

  async _changeAtDatabase() {
    for (const user of this.users) {
      await UserRepository.updateStatus(user.id, this._disabled, {
        batch: this.batch,
        currentUser: this.currentUser,
      });
    }
  }

  async _changeAtAuthentication() {
    for (const user of this.users) {
      if (user.authenticationUid) {
        const uid = user.authenticationUid;

        if (user.disabled) {
          await AuthFirebaseService.enable(uid);
        } else {
          await AuthFirebaseService.disable(uid);
        }
      } 
    }
  }

  async _isDisablingHimself() {
    return (
      this._disabled &&
      this._ids.includes(this.currentUser.id)
    );
  }

  async _validate() {
    assert(this.currentUser, 'currentUser is required');
    assert(this.currentUser.id, 'currentUser.id is required');
    assert(this.currentUser.email, 'currentUser.email is required');
    assert(this._ids && this._ids.length, 'ids is required');

    if (await this._isDisablingHimself()) {
      throw new ValidationError(this.language, 'iam.errors.disablingHimself');
    }
  }
};
