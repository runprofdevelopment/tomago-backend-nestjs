const PermissionChecker = require('../services/iam/permissionChecker');
const AuthFirebaseService = require('../infrastructure/auth/authFirebaseService');

module.exports = class StorageTokenGenerator {
  constructor({ language, currentUser }) {
    this.currentUser = currentUser;
    this.permissionChecker = new PermissionChecker({
      language,
      currentUser,
    });
  }

  generateStorageToken() {
    const metadata = {};

    this.permissionChecker
      .allowedStorageFolders()
      .forEach((allowedStorageFolder) => {
        metadata[allowedStorageFolder] = true;
      });

    return AuthFirebaseService.createCustomToken(
      this.currentUser.authenticationUid,
      metadata,
    );
  }
};
