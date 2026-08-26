const schema = `
  type Customer {
    id: String!
    authenticationUid: String
    firstName: String
    lastName: String
    fullName: String
    email: String
    phoneNumber: String
    disabled: Boolean
    accountType: String
    avatar: Avatar
    lang: String
    roles: [ String! ]
    phoneVerified: Boolean

    birthDate: DateTime
    nationality: String
    gender: GenderEnum
    providerId: String
    deviceTokens: JSON

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String  
  }
`;

// #deviceTokens: [String]
// #avatars: [File!]
const resolver = {};

exports.schema = schema;
exports.resolver = resolver;

// deviceToken: [String]!
