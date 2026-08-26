const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class ContactUs extends AbstractEntityModel {
  constructor() {
    super('contactUs', 'contactUs', {
      firstName: new types.String(),
      lastName: new types.String(),
      fullName: new types.String(),
      email: new types.String(),
      phoneNumber: new types.String(),
      message: new types.String(),
      attachFile: new types.File(),
    });
  }
};