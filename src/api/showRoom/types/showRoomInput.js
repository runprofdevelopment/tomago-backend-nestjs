const schema = `
  input ShowRoomInput {
    name: LocalizationInput!
    description: LocalizationInput
    project_id: String
    image: AvatarInput
    address: String
    phone: String
    email: String
    working_hours: String
    location: String
    isActive: Boolean
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
