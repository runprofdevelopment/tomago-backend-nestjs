const assert = require('assert');
const lodash = require('lodash');
// const _get = require('lodash/get');

module.exports = class AuthUser {
  constructor(action = 'create') {
    this.action = action;
    this.fields = [
      { name: 'displayName', type: '', required: false },
      { name: 'photoURL', type: '', required: false },
      { name: 'email', type: '', required: true },
      { name: 'password', type: '', required: true },
      { name: 'phoneNumber', type: '', required: true },
      { name: 'emailVerified', type: '', required: false },
      { name: 'disabled', type: '', required: false },

      { name: 'avatars', type: '', required: false },
      // { name: 'avatar', type: '', required: false },
      { name: 'fullName', type: '', required: false },
      { name: 'firstName', type: '', required: false },
      { name: 'lastName', type: '', required: false },
    ]
  }

  /**
   * Validate the field data
   * @param {String} data 
   * @returns 
   */
  validate(data) {
    if (!data) {
      return;
    }
    const FIELD_NAME = `\"data\"`
    assert(lodash.isObject(data), `Variable ${FIELD_NAME} got invalid value ${data}; Expected type JSON; JSON cannot represent a non json value: ${data}`);
    
    Object.keys(data).forEach(fieldName => {
      assert(this.fields.map(field => field.name).includes(fieldName), `This field "${FIELD_NAME}.${fieldName}" is not supported`)
      // if (!lodash.isEmpty(data[fieldName])) {};
    });
  }

  cast(data) {
    if (!data) {
      return null
    }

    const user = {}
    if (!lodash.isEmpty(data.uid) && lodash.isString(data.uid)) {
      data['uid'] = data.uid;
    }

    if (lodash.isString(data.displayName) || lodash.isString(data.fullName)) {
      user['displayName'] = data.fullName || data.displayName;
    } else if (lodash.isString(data.firstName) || lodash.isString(data.lastName)) {
      user['displayName'] = `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim();
    }

    if ((!lodash.isEmpty(data.photoURL) && lodash.isString(data.photoURL)) || (data.avatars && data.avatars.length)) {
      user['photoURL'] = data.photoURL || data.avatars[0].publicUrl
    }
    if (!lodash.isEmpty(data.email) && lodash.isString(data.email)) {
      user['email'] = data.email.trim()
    }
    if (!lodash.isEmpty(data.phoneNumber) && lodash.isString(data.phoneNumber)) {
      user['phoneNumber'] = data.phoneNumber.includes('+')
        ? data.phoneNumber.trim()
        : data.countryCode ? `${data.countryCode}${data.phoneNumber}`.trim() : null
    }
    if (!lodash.isEmpty(data.password) && lodash.isString(data.password)) {
      user['password'] = data.password
    }
    if (lodash.isBoolean(data.disabled)) {
      user['disabled'] = data.disabled
    }
    if (lodash.isBoolean(data.emailVerified)) {
      user['emailVerified'] = data.emailVerified
    }

    return user ? user : null 
  }
};