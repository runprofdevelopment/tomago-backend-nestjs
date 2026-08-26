const Roles = require('../roles');
const roles = Roles.values;

const permissions = {
  auditLogRead: {
    id: 'auditLogRead',
    allowedRoles: [
      roles.owner, 
      roles.viewer,
      roles.auditLogViewer, 
    ],
  },
}

module.exports = permissions;