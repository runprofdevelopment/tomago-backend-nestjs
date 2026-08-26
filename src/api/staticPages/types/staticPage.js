const schema = `
  type StaticPage {
    id: String
    body_html: Localization

    
    createdAt: DateTime
    createdBy: String
    updatedAt: DateTime
    updatedBy: String
  }
`;

const resolver = {};
exports.schema = schema;
exports.resolver = resolver;
