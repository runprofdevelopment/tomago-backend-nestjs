const admin = require('firebase-admin');
const assert = require('assert');
const InvitationEmail = require('../emails/invitationEmail');
const ValidationError = require('../../errors/validationError');
const EmailSender = require('../../infrastructure/email/emailSender');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const UserRepository = require('../../database/repositories/userRepository');

module.exports = class IamCreator {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;

    this.batch = null;
    this.data = null;
    this.emailsToInvite = [];
    this.sendInvitationEmails = false;
  }

  async createUserInAuthAndFirestore(data) {
    const authenticationUid = await this.createUserInAuthTable(data.email, data.password, data.countryCode + data.phoneNumber) 
    data['authenticationUid'] = authenticationUid;
    delete data.password;
    return await this.createUserInFirestoreTable(data);
  }

  async createUserInAuthTable(email, password, phoneNumber) {
    console.log('phoneNumber', phoneNumber);
    const userRecord = await admin.auth().createUser({
      email,
      password,
      phoneNumber,
      emailVerified: true,
    });
    return userRecord.uid;
  }

  async createUserInFirestoreTable(data, sendInvitationEmails = true) {
    this.data = data;
    this.sendInvitationEmails = sendInvitationEmails;

    try {
      const user = { ...this.data, email: this.data.email, roles: this._roles };

      this.batch = await FirebaseHelper.createBatch();     
      const record = await UserRepository.create(user, {
        currentUser: this.currentUser,
        batch: this.batch,
      });
      await FirebaseHelper.commitBatch(this.batch);

      if (this._hasEmailsToInvite) {
        await this._sendAllInvitationEmails();
      }
      console.log('record ===> ', record);

      return record;
    } catch (error) {
      throw error;
    }    
  }

  async execute(data, sendInvitationEmails = true) {
    this.data = data;
    this.sendInvitationEmails = sendInvitationEmails;
    await this._validate();
    
    try {
      this.batch = await FirebaseHelper.createBatch();
      if (this.emails.length === 1) {
        await this._addOrUpdateOneOfOne();
      } else {
        await this._addOrUpdateMany();
      }     
      await FirebaseHelper.commitBatch(this.batch);
    } catch (error) {
      throw error;
    }

    if (this._hasEmailsToInvite) {
      await this._sendAllInvitationEmails();
    }
  }

  async _addOrUpdateOneOfOne() {
    const email = this.emails[0];

    const exists = (await UserRepository.count({ email })) > 0;
    if (exists) {
      throw new ValidationError(this.language, 'iam.errors.userAlreadyExists');
    }

    await UserRepository.create({ ...this.data, email, roles: this._roles }, {
      currentUser: this.currentUser,
      batch: this.batch,
    });

    this.emailsToInvite.push(email);
  }

  async _addOrUpdateMany() {
    return Promise.all(
      this.emails.map((email) => this._addOrUpdateOneOfMany(email))
    );
  }

  async _addOrUpdateOneOfMany(email) {
    let user = await UserRepository.findByEmail(email, {
      batch: this.batch,
    });

    if (user) {
      await UserRepository.updateRoles(user.id, this._roles, {
        addRoles: true,
        currentUser: this.currentUser,
        batch: this.batch,
      });
    } else {
      await UserRepository.create({ email, roles: this._roles }, {
        currentUser: this.currentUser,
        batch: this.batch,
      });

      this.emailsToInvite.push(email);
    }
  }

  async _sendAllInvitationEmails() {
    if (!this.sendInvitationEmails) return;

    return Promise.all(
      this.emailsToInvite.map((emailToInvite) => {
        const invitationEmail = new InvitationEmail(this.language, emailToInvite);
        return new EmailSender(invitationEmail).send();
      }),
    );
  }

  get _roles() {
    if (this.data.roles && !Array.isArray(this.data.roles)) {
      return [this.data.roles];
    } else {
      const uniqueRoles = [...new Set(this.data.roles)];
      return uniqueRoles;
    }
  }

  get _emails() {
    if (this.data.emails && !Array.isArray(this.data.emails)) {
      this.emails = [this.data.emails];
    } else {
      const uniqueEmails = [...new Set(this.data.emails)];
      this.emails = uniqueEmails;
    }

    return this.emails.map((email) => email.trim());
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
    assert(this._emails && this._emails.length, 'emails is required');
    assert(this._roles && this._roles.length, 'roles is required');
  }
};