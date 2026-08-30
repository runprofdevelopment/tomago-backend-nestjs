const ExcelExportService = require('../../../services/export/excelExportService');

const schema = `
  exportExcel(collection: String!, fields: [String!], ids: [String!]): ExportFile!
`;

const resolver = {
  exportExcel: async (root, args, context) => {
    const result = await new ExcelExportService(context).export({
      collection: args.collection,
      fields: args.fields,
      ids: args.ids,
    });

    return {
      url: null,
      contentBase64: Buffer.from(result.buffer).toString('base64'),
      mimeType: result.mimeType,
      fileName: result.fileName,
    };
  },
};

exports.schema = schema;
exports.resolver = resolver;
