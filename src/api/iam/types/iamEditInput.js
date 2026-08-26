const schema = `
  input IamEditInput {
    id: String!
    firstName: String
    lastName: String
    fullName: String
    phoneNumber: String
    avatar: FileInput
    roles: [ String! ]!
    lang: String
  }
  
  input CustomerEditInput {
    id: String!
    firstName: String
    lastName: String
    fullName: String
    phoneNumber: String
    avatar: FileInput
    roles: [ String! ]!
    lang: String

    birthDate: DateTime
    nationality: String
    gender: GenderEnum
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;