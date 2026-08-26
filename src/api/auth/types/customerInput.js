const schema = `
  input CustomerInput {
    firstName: String!
    lastName: String!
    phoneNumber: String

    avatar: FileInput
    birthDate: DateTime
    nationality: String
    gender: GenderEnum
    lang: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;