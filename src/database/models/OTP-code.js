const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class Brand extends AbstractEntityModel {
  constructor() {
    super('OTP-code', 'OTP-code', {
      id: new types.String(),
      userId: new types.String(),
      otpCode: new types.String(),
      phoneNumber: new types.String(),
      expirationTime: new types.DateTime(), 
      documentRef: new types.Reference(),
      // expirationTime: new types.Number(), 

      // TTL: new types.Number(), // TimeToLive (TTL) / Validity Duration
    });
  }
};