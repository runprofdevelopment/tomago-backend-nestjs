const schema = `
  type ExportFile {
    url: String
    contentBase64: String
    mimeType: String
    fileName: String
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
