const Roles = require('../roles');
const roles = Roles.values;

const permissions = {
  brandCreate: {
    id: 'brandCreate',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
    ],
  },
  brandEdit: {
    id: 'brandEdit',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
      roles.brandEditor,
    ],
    allowedStorageFolders: ['brand'],
  },
  brandDestroy: {
    id: 'brandDestroy',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
      roles.brandEditor,
    ],
    allowedStorageFolders: ['brand'],
  },
  brandImport: {
    id: 'brandImport',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.editor,
      roles.brandEditor,
    ],
  },
  brandRead: {
    id: 'brandRead',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.viewer,
      roles.editor,
      roles.brandEditor,
      roles.brandViewer,
    ],
  },
  brandUserAutocomplete: {
    id: 'brandUserAutocomplete',
    allowedRoles: [
      roles.owner,
      roles.admin,
      roles.viewer,
      roles.editor,
      roles.brandEditor,
      roles.brandViewer,
    ],
  },
}

module.exports = permissions;