// const functions = require('firebase-functions');
// Use initialized Firebase Admin
const admin = require('../firebaseInit');
const AuthUser = require('./authUserModel');

module.exports = class AuthFirebaseService {
  static async verifyIdToken(idToken) {
    return admin.auth().verifyIdToken(idToken);
  }

  static async createCustomToken(uid, metadata) {
    return admin.auth().createCustomToken(uid, metadata);
  }

  static async getUserByEmail(email) {
    return admin.auth().getUserByEmail(email);
  }

  static async getUser(uid) {
    return admin.auth().getUser(uid);
  }

  static async disable(uid) {
    await admin.auth().updateUser(uid, {
      disabled: true,
    });
  }

  static async enable(uid) {
    await admin.auth().updateUser(uid, {
      disabled: false,
    });
  }

//#region [ Manage Users ]
  /**
   * Creates a new user.
   * See https://firebase.google.com/docs/auth/admin/manage-users#create_a_user | Create a user for code samples and detailed documentation.
   * 
   * @param {Object} data The properties to set on the new user record to be created.
   * @param {String?} data.uid The uid to assign to the newly created user. Must be a string between 1 and 128 characters long, inclusive. If not provided, a random uid will be automatically generated.
   * @param {String} data.displayName The users' display name.
   * @param {String} data.fullName The users' display name.
   * @param {String} data.firstName The users' display name.
   * @param {String} data.lastName The users' display name.
   * @param {String} data.photoURL The user's photo URL.
   * @param {Object[]} data.avatars 
   * @param {String} data.avatars.publicUrl 
   * @param {String} data.email The user's primary email. Must be a valid email address.
   * @param {String} data.phoneNumber The user's primary phone number. Must be a valid E.164 spec compliant phone number.
   * @param {Boolean} data.emailVerified Whether or not the user's primary email is verified. If not provided, the default is false.
   * @param {String} data.password The user's new raw, unhashed password. Must be at least six characters long.
   * @param {Boolean} data.disabled Whether or not the user is disabled. true for disabled; false for enabled. If not provided, the default is false.
   * @return A promise fulfilled with the user data corresponding to the newly created user.
   */
  static async createUser(data) {
    const AuthUserModel = new AuthUser('create')
    AuthUserModel.validate(data)
    const user = AuthUserModel.cast(data)
    const userRecord = await admin.auth().createUser(user)
    return userRecord
  }

  /**
   * Updates an existing user.
   * See https://firebase.google.com/docs/auth/admin/manage-users#update_a_user | Update a user for code samples and detailed documentation.
   * 
   * @param {String} uid The uid corresponding to the user to update.
   * @param {Object} data The properties to update on the provided user.
   * @param {String?} data.displayName The users' new display name. Set to null to clear the user's existing display name.
   * @param {String?} data.fullName The users' new display name. Set to null to clear the user's existing display name.
   * @param {String?} data.photoURL The users' new photo URL. Set to null to clear the user's existing photo URL. If non-null, must be a valid URL
   * @param {Object[]} data.avatars 
   * @param {String} data.avatars.publicUrl 
   * @param {String} data.email The user's new primary email. Must be a valid email address.
   * @param {String} data.phoneNumber The user's new primary phone number. Must be a valid E.164 spec compliant phone number. Set to null to clear the user's existing phone number.
   * @param {Boolean} data.emailVerified 
   * @param {String} data.password The user's new raw, unhashed password. Must be at least six characters long.
   * @param {Boolean} data.disabled Whether or not the user is disabled. true for disabled; false for enabled.
   * @return A promise fulfilled with the updated user data.
   */
  static async updateUser(uid, data) {
    const AuthUserModel = new AuthUser('update');
    // AuthUserModel.validate(data);
    const user = AuthUserModel.cast(data);
    const userRecord = await admin.auth().updateUser(
      uid, 
      user
    );
    return userRecord;
  }

  /**
   * Deletes an existing user.
   * - See https://firebase.google.com/docs/auth/admin/manage-users#delete_a_user | Delete a user for code samples and detailed documentation.
   * @param {String} uid The uid corresponding to the user to delete.
   */
  static async deleteUser(uid) {
    if (!uid) return 

    try {
      await admin.auth().deleteUser(uid);
      console.log('Successfully deleted user');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Deletes the users specified by the given uids.
   *
   * Deleting a non-existing user won't generate an error (i.e. this method is idempotent.) 
   * Non-existing users are considered to be successfully deleted, 
   * and are therefore counted in the DeleteUsersResult.successCount value.
   *
   * Only a maximum of 1000 identifiers may be supplied. 
   * If more than 1000 identifiers are supplied, this method throws a FirebaseAuthError.
   *
   * This API is currently rate limited at the server to 1 QPS. If you exceed this, 
   * you may get a quota exceeded error. Therefore, if you want to delete more than 1000 users, 
   * you may need to add a delay to ensure you don't go over this limit.
   * @param {*} uids The uids corresponding to the users to delete.
   */
  static async deleteUsers(uids) {
    if (!uids || !uids.length) return
    
    try {
      const deleteUsersResult = await admin.auth().deleteUsers(uids);
      
      console.log(`Successfully deleted ${deleteUsersResult.successCount} users`);
      console.log(`Failed to delete ${deleteUsersResult.failureCount} users`);
      deleteUsersResult.errors.forEach((err) => {
        console.log(err.error.toJSON());
      });
    } catch (error) {
      console.log('Error deleting users:', error);
    }
  }

  /**
   * Retrieves a list of users (single batch only) with a size of maxResults starting from the offset as specified by pageToken. 
   * This is used to retrieve all the users of a specified project in batches.
   * 
   * See https://firebase.google.com/docs/auth/admin/manage-users#list_all_users | List all users for code samples and detailed documentation.
   * @param {String} nextPageToken The next page token. If not specified, returns users starting without any offset.
   * @returns {Promise<UserRecord[]>} A promise that resolves with the current batch of downloaded users and the next page token
   */
  static async listAllUsers(nextPageToken = null) {
    // List batch of users, 1000 at a time.
    const users = []
    await admin.auth().listUsers(1000, nextPageToken)
    .then((listUsersResult) => {
      listUsersResult.users.forEach((userRecord) => {
        const user = userRecord.toJSON()
        users.push(user)
      });
      if (listUsersResult.pageToken) {
        // List next batch of users.
        listAllUsers(listUsersResult.pageToken);
      }
    })
    .catch((error) => {
      console.log('Error listing users:', error);
    });
    // console.log('Users List =', users);
    return users
  }
//#endregion
};