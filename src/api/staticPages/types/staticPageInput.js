const schema = `
  input StaticPageInput {
    body_html: LocalizationInput
  }
`;
  
const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
