const schema = `
  type ContactUs {
    id: String
    firstName: String
    lastName: String
    fullName: String
    email: String
    phoneNumber: String
    message: String
    attachFile: File

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;