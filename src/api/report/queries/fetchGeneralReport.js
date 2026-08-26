const GeneralReport = require('../../../services/report/generalReport');
// const PermissionChecker = require('../../../services/iam/permissionChecker');
// const permissions = require('../../../security/permissions').values;

const schema = `
  fetchGeneralReport(filter: GeneralReportFilterInput): GeneralReport
`;

const resolver = {
  fetchGeneralReport: async (root, args, context, info) => {
    // new PermissionChecker(context).validateHas(permissions.reviewRead);
    return GeneralReport.fetch(args.filter);
  },
};

exports.schema = schema;
exports.resolver = resolver;