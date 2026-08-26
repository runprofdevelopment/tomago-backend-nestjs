const schema = `
  type User {
    id: String!
    authenticationUid: String
    firstName: String
    lastName: String
    fullName: String
    email: String
    emailVerified: Boolean
    phoneNumber: String
    phoneVerified: Boolean
    disabled: Boolean
    accountType: String
    avatar: Avatar
    lang: String
    roles: [ String! ]

    birthDate: DateTime
    nationality: String
    gender: GenderEnum
    providerId: String
    deviceTokens: JSON
    default_address: Address 

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String  
  }
  
  type Owner {
    id: String
    avatar: String
    name: Localization
    email: String
    phoneNumber: String
    type: AllUserTypeEnum
    rate: Float
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
