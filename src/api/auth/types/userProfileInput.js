const schema = `
  input CombinedProfileInput {
    userInput: UserProfileInput
    adminInput: AdminProfileInput
  }

  input AdminProfileInput {
    firstName: String
    lastName: String
    phoneNumber: String
    avatar: FileInput
    lang: String
  }

  input UserProfileInput {
    firstName: String
    lastName: String
    phoneNumber: String
    avatar: FileInput
    lang: String
    birthDate: DateTime
    nationality: String
    gender: GenderEnum
  }
`;
  
const resolver = {};

exports.schema = schema;
exports.resolver = resolver;