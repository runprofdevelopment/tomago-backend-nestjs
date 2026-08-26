const { i18n } = require('../../i18n');
const assert = require('assert');
const EmailService = require('../emails/emailService');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const UserRepository = require('../../database/repositories/userRepository');
const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');

module.exports = class AdminCreator {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;

    this.batch = null;
    this.data = null;
    this.emailsToInvite = [];
    this.sendInvitationEmails = false;
  }

  async execute(data, sendInvitationEmails = true) {
    this.data = data;
    const accountType = this.currentUser.accountType;
    if (accountType !== 'owner') {
      throw new Error("You don't have permission to create admin");
    }
    this.sendInvitationEmails = sendInvitationEmails;
    await this._validate();
    
    try {
      this.batch = await FirebaseHelper.createBatch();     
      
      const { uid, password } = await this._createAtAuthentication();
      this.data['authenticationUid'] = uid;
      
      const record = await this._createAtDatabase();
      await this._sendInvitationEmail(this._email, password);

      await FirebaseHelper.commitBatch(this.batch);
      return record;
    } catch (error) {
      throw error;
    }
  }

  async _createAtAuthentication() {
    const password = await this._generatePassword();
    const userRecord = await AuthFirebaseService.createUser({
      email: this._email,
      password: password,
      phoneNumber: this.data.phoneNumber,
      emailVerified: true,
      disabled: false,
      firstName: this.data.firstName,
      lastName: this.data.lastName,
    });

    return { uid: userRecord.uid, password };
  }

  async _createAtDatabase() {
    const email = this._email;

    const exists = (await UserRepository.count({ email })) > 0;
    if (exists) {
      // throw new ValidationError(this.language, 'iam.errors.userAlreadyExists');
      throw new Error(i18n(this.language, 'iam.errors.userAlreadyExists', email));
    }

    const user = {
      ...this.data, 
      email, 
      roles: this._roles,
      accountType: 'admin',
      providerId: 'password',
    }

    const record = await UserRepository.create(user, {
      currentUser: this.currentUser,
      batch: this.batch,
      modelType: 'user',
    });

    return record;
  }
  
  async _sendInvitationEmail(email, password) {
    // const email = this._email;
    const context = { password };
    // await EmailService.sendSignInLinkEmail(email, this.language, 'admin');
    await EmailService.sendInvitationEmail(email, this.language, 'admin', context);
  }

  get _roles() {
    if (this.data.roles && !Array.isArray(this.data.roles)) {
      return [this.data.roles];
    } else {
      const uniqueRoles = [...new Set(this.data.roles)];
      return uniqueRoles;
    }
  }

  get _email() {
    return this.data && this.data.email 
      ? this.data.email.trim()
      : null;
  }

  get _hasEmailsToInvite() {
    return (
      this.emailsToInvite && this.emailsToInvite.length
    );
  }

  async _validate() {
    assert(this.currentUser, 'currentUser is required');
    assert(this.currentUser.id, 'currentUser.id is required');
    assert(this.currentUser.email, 'currentUser.email is required');
    assert(this._email, 'email is required');
    // assert(this._emails && this._emails.length, 'emails is required');
    // assert(this._roles && this._roles.length, 'roles is required');
  }

  async _generatePassword() {
    try {
      const generator = require('generate-password');
      const password = generator.generate({
        length: 10,
        numbers: true
      });
      
      // Generates a hashed password to hide the original one.
      // const BCRYPT_SALT_ROUNDS = 12;
      // const bcrypt = require('bcrypt');
      // const hashedPassword = await bcrypt.hash(
      //   password,
      //   BCRYPT_SALT_ROUNDS,
      // );

      return password;
    } catch (error) {
      console.error(error);
    }
  }
};