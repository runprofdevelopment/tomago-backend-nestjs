const schema = `
  enum RoleWithUsersOrderByEnum {
    role_ASC
    role_DESC

    firstName_ASC
    firstName_DESC
    
    lastName_ASC
    lastName_DESC
   
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
