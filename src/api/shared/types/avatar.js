const schema = `
  type Avatar {
    name: String
    publicUrl: String
  }
  
  input AvatarInput {
    name: String
    publicUrl: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
