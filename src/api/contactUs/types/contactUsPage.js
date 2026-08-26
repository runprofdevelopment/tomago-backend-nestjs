const schema = `
  type ContactUsPage {
    rows: [ContactUs!]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
