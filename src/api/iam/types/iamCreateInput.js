const schema = `
  input IamCreateInput {
    authenticationUid: String
    email: String
    firstName: String
    lastName: String
    fullName: String
    phoneNumber: String
    avatar: FileInput
    roles: [ String! ]!
    lang: String
    disabled: Boolean
    accountType: AccountTypeEnum
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
