const schema = `
  type WalletPage {
    rows: [ Wallet! ]!
    count: Int!
    pagination: Pagination
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
