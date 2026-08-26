const DealViewer = require('../../../services/deals/dealViewer');
const PermissionChecker = require('../../../security/permissionChecker');
const permissions =
  require('../../../security/permissions').values;

const graphqlSelectRequestedAttributes = require('../../shared/utils/graphqlSelectRequestedAttributes');

const schema = `
  dealListAll(status: DealStatusEnum): JSON
`;

const resolver = {
  dealListAll: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.dealRead);
    return new DealViewer(context).listAll(args.status);
  },


};

exports.schema = schema;
exports.resolver = resolver;
