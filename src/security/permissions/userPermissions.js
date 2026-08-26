const Roles = require('../roles');
const roles = Roles.values;

const permissions = {
  userCreate: {
    id: 'userCreate',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
      roles.usersEditor,
    ],
  },
  userEdit: {
    id: 'userEdit',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
      roles.usersEditor,
    ],
    allowedStorageFolders: ['user'],
  },
  userDestroy: {
    id: 'userDestroy',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
      roles.usersEditor,
    ],
    allowedStorageFolders: ['user'],
  },
  userImport: {
    id: 'userImport',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
      roles.usersEditor,
    ],
  },
  userRead: {
    id: 'userRead',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.viewer,
      roles.editor,
      roles.usersEditor,
      roles.usersViewer,
    ],
  },
  userUserAutocomplete: {
    id: 'userUserAutocomplete',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.viewer,
      roles.editor,
      roles.usersEditor,
      roles.usersViewer,
    ],
  },

  rolesRead: {
    id: 'rolesRead',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
      roles.usersEditor,
    ],
  },
  userChangeStatus: {
    id: 'userChangeStatus',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
      roles.usersEditor,
      // roles.portalBranchManager,
    ],
  },
}

module.exports = permissions;