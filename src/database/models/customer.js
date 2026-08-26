const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class User extends AbstractEntityModel {
  constructor() {
    super('user', 'user', {
      // uid: new types.String(null, 255),
      authenticationUid: new types.String(null, 255),
      firstName: new types.String(null, 80),
      lastName: new types.String(null, 175),
      fullName: new types.String(null, 255),

      email: new types.String(null, 255),
      emailVerified: new types.Boolean(false),
      phoneNumber: new types.String(null, 24),
      phoneVerified: new types.Boolean(false),

      disabled: new types.Boolean(),
      avatar: new types.Avatar(),
      lang: new types.Enumerator(['en', 'ar'], 'en'),
      roles: new types.StringArray(),

      birthDate: new types.DateTime(),
      nationality: new types.String(),
      gender: new types.Enumerator(['male', 'female']),
      accountType: new types.Enumerator(
        ['customer'],
        'customer',
      ),
      providerId: new types.String(),
      deviceTokens: new types.Json(),
      // wishlist: new types.StringArray(),
      // recently_viewed: new types.StringArray(),
      // importHash: new types.String(null, 255),
    });
  }
};
