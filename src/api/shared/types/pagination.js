const schema = `
  type Pagination {
    totalCount: Int
    pageSize: Int
    pagesNumber: Int
    isFirstPage: Boolean
    isLastPage: Boolean
  }
`;
  
const resolver = {};

exports.schema = schema;
exports.resolver = resolver;