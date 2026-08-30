const schema = `
  type ShowRoom {
    id: String
    name: Localization
    description: Localization
    project_id: String
    image: Avatar
    address: String
    phone: String
    email: String
    working_hours: String
    location: String
    isActive: Boolean

    createdAt: DateTime
    updatedAt: DateTime
    createdBy: String
    updatedBy: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
