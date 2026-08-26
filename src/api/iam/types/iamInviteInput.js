const schema = `
  input IamInviteInput {
    email: String
    firstName: String
    lastName: String
    fullName: String
    phoneNumber: String
    avatar: FileInput
    roles: [ String! ]!
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;