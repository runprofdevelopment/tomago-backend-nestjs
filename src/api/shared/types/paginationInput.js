const schema = `
  input PaginationInput {
    limit: Int
    offset: Int
    page: Int
    doc: JSON
    sortBy: SortByEnum
    action: ActionTypeEnum
  }

  enum ActionTypeEnum {
    next
    prev
    current
  }

  enum SortByEnum {
    asc
    desc
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
