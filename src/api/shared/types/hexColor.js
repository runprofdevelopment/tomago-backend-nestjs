const schema = `
  type HexColor {
    color: String
    opacity: Float
  }

  input HexColorInput {
    color: String
    opacity: Float
  }
`;
  
const resolver = {};
exports.schema = schema;
exports.resolver = resolver;
