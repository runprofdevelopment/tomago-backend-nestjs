const types = require('./types');
const AbstractEntityModel = require('./abstractEntityModel');

module.exports = class User extends AbstractEntityModel {
  constructor() {
    super('user', 'user', {
      // uid: new types.String(null, 255),
      authenticationUid: new types.String(null, 255),
      email: new types.String(null, 255),
      emailVerified: new types.Boolean(false),
      firstName: new types.String(null, 80),
      lastName: new types.String(null, 175),
      fullName: new types.String(null, 255),
      phoneNumber: new types.String(null, 24),
      disabled: new types.Boolean(),
      avatar: new types.Avatar(),
      lang: new types.Enumerator(['en', 'ar'], 'en'),
      roles: new types.StringArray(),
      accountType: new types.Enumerator([
        'owner',
        'admin',
        // 'administrator',
      ]),
      providerId: new types.String(),
      // importHash: new types.String(null, 255),
    });
  }
};

//  [1] User ID: A unique identifier for each user in the database.
//  [2] Username: The username chosen by the user for authentication purposes.
//  [3] Email: The user's email address, often used for communication and account verification.
//  [4] Password: A secure representation of the user's password, usually stored as a hash.
//  [5] First Name: The user's first name.
//  [6] Last Name: The user's last name.
//  [7] Address: The user's physical address or shipping address.
//  [8] Phone Number: The user's contact phone number.
//  [9] Cart: The user's current shopping cart, which may include details like product IDs and quantities.
// [10] Orders: A reference to the user's order history, linking to their past and current orders.
// [11] Payment Information: Details related to the user's preferred payment method, such as credit card information or payment gateway tokens.
// [12] Wishlist: Products the user has added to their wishlist for future reference or purchase.
// [13] Preferences: User preferences or settings, such as language, currency, or notification preferences.
// [14] Role or Permissions: User roles or permissions that determine access levels and privileges within the application.
// [15] Timestamps: Fields to track the creation and update timestamps of the user record.
