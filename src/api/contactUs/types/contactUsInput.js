const schema = `
  input ContactUsInput {
    firstName: String
    lastName: String
    email: String
    phoneNumber: String
    message: String
    attachFile: FileInput
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
