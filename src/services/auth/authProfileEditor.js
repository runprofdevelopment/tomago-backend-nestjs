const assert = require('assert');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const UserRepository = require('../../database/repositories/userRepository');
const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');
const ErrorHandler = require('../../errors/errorHandler');

module.exports = class AuthProfileEditor {
  constructor(context) {
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.batch = null;
  }

  async execute(data) {
    this.data = data;   
    await this._validate();

    try {
      this.batch = await FirebaseHelper.createBatch();
      await this._loadUser();
      await this._updateAtDatabase();

      await FirebaseHelper.commitBatch(this.batch);
    } catch (error) {
      throw error;
    }

    await this._updateAtAuthentication();
  }

  async changeMyPassword(oldPassword, newPassword) {
    try {
      const admin = require('firebase-admin');
      const auth = admin.auth();
      
      const uid = this.currentUser.id;
      const email = this.currentUser.email;
      
      if (!email) {
        throw new Error('User email is required');
      }
      
      try {
        // First, try to update the user's password
        await auth.updateUser(uid, {
          password: newPassword,
        });
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // If user doesn't exist in Auth but exists in Firestore
          try {
            // Try to create the auth user
            await auth.createUser({
              uid: uid,
              email: email,
              password: newPassword,
              emailVerified: true
            });
          } catch (createError) {
            if (createError.code === 'auth/email-already-exists') {
              // If email is already in use, find that user and update their password
              const userRecord = await auth.getUserByEmail(email);
              await auth.updateUser(userRecord.uid, {
                password: newPassword
              });
              
              // If the UIDs don't match, we might want to merge the accounts
              if (userRecord.uid !== uid) {
                console.warn(`User with email ${email} has different UIDs in Auth (${userRecord.uid}) and Firestore (${uid})`);
                // Consider if you want to update Firestore to use the Auth UID
                // or handle this case differently based on your requirements
              }
            } else {
              throw createError;
            }
          }
        } else if (error.code === 'auth/email-already-exists') {
          // Handle case where user exists but with a different UID
          const userRecord = await auth.getUserByEmail(email);
          await auth.updateUser(userRecord.uid, {
            password: newPassword
          });
        } else {
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      let ERROR = error;
      if (error.code === 'auth/wrong-password') {
        ERROR = new ErrorHandler({
          errorCode: 'auth/wrong-password',
          message: 'The password you entered is incorrect.',
        });
      }
      throw ERROR;
    }
  }

  //   async changeMyPassword(oldPassword, newPassword) {
  //   try {
  //     const { getAuth } = require('firebase-admin/auth');
  //     const firebase = require('firebase/auth');
      
  //     const email = this.currentUser.email;
  //     const auth = firebase.getAuth();
  //     const userCredential = await firebase.signInWithEmailAndPassword(auth, email, oldPassword); // Signed in 
      
  //     const user = userCredential.user;
  //     const uid = user.uid;
  //     await getAuth().updateUser(uid, {
  //       password: newPassword,
  //     });
  //     return true
  //   } catch (error) {
  //     let ERROR = error;
  //     if (error.code == 'auth/wrong-password') {
  //       ERROR = new ErrorHandler({
  //         errorCode: 'auth/wrong-password',
  //         message: `The password ${oldPassword} is incorrect`, 
  //       });
  //     }
  //     throw ERROR;
  //   }
  // }


  async _loadUser() {
    this.user = await UserRepository.findById(this.currentUser.id);
  }

  async _updateAtDatabase() {
    this.user = await UserRepository.updateProfile(this.currentUser.id, this.data, {
      currentUser: this.currentUser,
      batch: this.batch,
      modelType: this._modelType,
    });
    console.log('Update profile at Database', this.user);
  }

  async _updateAtAuthentication() {
    if (this.user.authenticationUid) {
      await AuthFirebaseService.updateUser(
        this.user.authenticationUid,
        this.user,
      );
      console.log('Update profile at Authentication', this.user);
    }
  }

  get _modelType() {
    return (this.user && this.user.accountType == 'customer') 
      ? 'customer' 
      : 'user';
  }

  async _validate() {
    assert(this.currentUser, 'currentUser is required');
    assert(this.currentUser.id, 'currentUser.id is required');
    assert(this.currentUser.email, 'currentUser.email is required');
    assert(this.data, 'profile data is required');
  }
};