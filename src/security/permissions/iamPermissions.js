const Roles = require('../roles');
const roles = Roles.values;

const permissions = {
  iamCreate: {
    id: 'iamCreate',
    allowedRoles: [
      roles.owner,
      roles.iamSecurityReviewer,
      roles.editor,
    ],
  },
  iamEdit: {
    id: 'iamEdit',
    allowedRoles: [
      roles.owner,
      roles.iamSecurityReviewer,
      roles.editor,
    ],
    allowedStorageFolders: ['user'],
  },
  iamImport: {
    id: 'iamImport',
    allowedRoles: [
      roles.owner,
      roles.iamSecurityReviewer,
      roles.editor,
    ],
  },
  iamRead: {
    id: 'iamRead',
    allowedRoles: [
      roles.owner,
      roles.iamSecurityReviewer,
      roles.editor,
      roles.viewer,
    ],
  },
  iamUserAutocomplete: {
    id: 'iamUserAutocomplete',
    allowedRoles: [
      roles.owner,
      roles.editor,
      roles.viewer,
    ],
  },
}

module.exports = permissions;