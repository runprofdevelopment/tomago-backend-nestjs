const assert = require('assert');
const config = require('../../../config')();
const Roles = require('../../security/roles');
const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');
const UserRepository = require('../../database/repositories/userRepository');
const ErrorHandler = require('../../errors/errorHandler');

/** Handles all the Auth operations of the user. */
class AuthService {
  /**
   * @param {String} appId 
   * @returns {String} Requested From
   */
  static verifyAppId(appId) {
    const APP_IDS = config.appIds;

    // assert(appId, `appId is required`);
    if (!appId) throw new Error(`appId is required`);
    
    const appType = APP_IDS[appId];
    return appType;
  }


  /**
   * Finds the user if exists, otherwise creates the user using the auth provider info.
   * @param {String} uid
   * @param {Object} options
   * @param {String} options.accountType
   * @param {'ar'|'en'|String} options.language
   */
  static async findOrCreateFromAuth(uid, options = { language: 'en', accountType: null }) {
    console.log(options.accountType);
    options['modelType'] = options.accountType === 'customer' ? 'customer' : 'user';
    assert(uid, 'uuid is required');

    const authUser = await AuthFirebaseService.getUser(uid);
    assert(authUser, 'Authentication User not found');

    const isAnonymous = !authUser.providerData.length || authUser.providerData.some(provider => provider.providerId === 'anonymous');
    if (isAnonymous) {
      const UserRepository = require('../../database/repositories/userRepository');
      const currentUser = {
        id: uid,
        ...UserRepository.EMPTY_USER,
        accountType: options.accountType,
        providerId: 'anonymous',
        disabled: false,
      }
      return currentUser;
    }

    const { email, phoneNumber } = authUser;
    const databaseUser =
      await UserRepository.findByEmailOrPhone(email, phoneNumber) ||
      await UserRepository.findByAuthenticationUid(uid);

    /**
     * If the user exists on the database, updates the authentication uid
     * to ensure that it's aligned with the one in the authentication provider
     */
    if (databaseUser) {
      if (databaseUser.disabled && !authUser.disabled) {
        await AuthFirebaseService.disable(authUser.uid);
      }

      if (databaseUser.authenticationUid === authUser.uid) {
        return databaseUser;
      }

      return await UserRepository.updateAuthenticationUid(
        databaseUser.id,
        authUser.uid,
      );
    }

    const isFirstUser = (await UserRepository.count(null, options)) === 0;
    const accountType = isFirstUser ? 'owner' : (options && options.accountType) || 'customer';

    const createdDatabaseUser = await UserRepository.create({
      // id: authUser.uid || null,
      authenticationUid: authUser.uid || null,
      firstName: authUser.displayName || (authUser.email && authUser.email.split('@')[0]) || null,
      email: authUser.email || null,
      phoneNumber: authUser.phoneNumber || null,
      /** If the user is the first user, it's auto set as the owner.
       * New users have no permissions. You can override this behaviour here. */
      roles: isFirstUser ? [Roles.values.owner] : [],
      accountType: accountType || null,
      avatar: {
        name: 'profileImage',
        publicUrl: authUser.photoURL || null
      },
      providerId: authUser.providerData.length ? authUser.providerData[0].providerId : null,
    }, options);

    return await UserRepository.findById(createdDatabaseUser.id);
  }

  static async findFromAuth(uid) {
    assert(uid, 'uuid is required');

    const authUser = await AuthFirebaseService.getUser(uid);
    assert(authUser, 'Authentication User not found');

    const isAnonymous = !authUser.providerData.length || authUser.providerData.some(provider => provider.providerId === 'anonymous');
    if (isAnonymous) {
      const UserRepository = require('../../database/repositories/userRepository');
      const currentUser = {
        id: uid,
        ...UserRepository.EMPTY_USER,
        accountType: 'customer',
        providerId: 'anonymous',
        disabled: false,
      }
      return currentUser;
    }

    const providerData = authUser.providerData;
    const providerAccount = providerData.length ? providerData[0] : {};

    // Get email from authUser first, then fallback to providerAccount
    let email = authUser.email || providerAccount.email;
    
    // Validate email format if it exists
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.warn('AuthService.findFromAuth: Invalid email format detected:', email);
        email = null; // Set to null if invalid format
      }
    }
    
    const databaseUser = email
      ? await UserRepository.findByEmail(email)
      : await UserRepository.findByAuthenticationUid(uid);

    if (databaseUser) {
      if (databaseUser.disabled && !authUser.disabled) {
        await AuthFirebaseService.disable(authUser.uid);
      }

      if (databaseUser.authenticationUid === authUser.uid) {
        return databaseUser;
      }

      await UserRepository.updateAuthenticationUid(
        databaseUser.id,
        authUser.uid,
      );

      return { ...databaseUser, authenticationUid: authUser.uid };
    }

    // assert(databaseUser, 'User not found in database');
    // throw new Error('User not found in database');
    return this._castCurrentUserFormAuth(authUser, 'customer');
  }

  static _castCurrentUserFormAuth(authUser, castTo) {
    assert(authUser, `This account doesn't exist.`);
    
    const model = UserRepository.getUserModel(castTo);
    const providerData = authUser.providerData;
    const providerAccount = providerData.length ? providerData[0] : {};
    const providerId = providerData.length ? providerData[0].providerId.replace('.com', '') : null;
    
    // Get and validate email
    let email = authUser.email || providerAccount.email;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.warn('AuthService._castCurrentUserFormAuth: Invalid email format detected:', email);
        email = null; // Set to null if invalid format
      }
    }
    
    const currentUser = model.cast({
      authenticationUid: authUser.uid || null,
      firstName: authUser.displayName || providerAccount.displayName || (email && email.split('@')[0]) || null,
      disabled: authUser.disabled,
      email: email,
      emailVerified: authUser.emailVerified,
      phoneNumber: authUser.phoneNumber || providerAccount.phoneNumber,
      avatar: {
        name: 'photoURL',
        publicUrl: authUser.photoURL || providerAccount.photoURL || null
      },
      providerId,
    })
    
    return {
      ...currentUser,
      id: authUser.uid || null,
      creationTime: authUser.metadata.creationTime,
      lastSignInTime: authUser.metadata.lastSignInTime,
      lastRefreshTime: authUser.metadata.lastRefreshTime,
    }
  }

  /**
   * Mints a Firebase custom token for the given uid and exchanges it
   * for an ID token that can be used as Authorization: Bearer.
   * @param {String} uid
   */
  static async createTokenForUid(uid) {
    assert(uid, 'uid is required');

    let authUser;
    try {
      authUser = await AuthFirebaseService.getUser(uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new ErrorHandler({
          errorCode: 'auth/user-not-found',
          message: 'User not found',
        });
      }
      throw error;
    }

    if (!authUser) {
      throw new ErrorHandler({
        errorCode: 'auth/user-not-found',
        message: 'User not found',
      });
    }

    if (authUser.disabled) {
      throw new ErrorHandler({
        errorCode: 'auth/user-disabled',
        message: 'User account is disabled',
      });
    }

    const customToken = await AuthFirebaseService.createCustomToken(uid);
    const apiKey = config.firebaseConfig.apiKey || config.apiKey;

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      },
    );

    const result = await response.json();
    if (!response.ok || !result.idToken) {
      throw new ErrorHandler({
        errorCode: result.error?.message || 'auth/token-exchange-failed',
        message: result.error?.message || 'Failed to exchange custom token for ID token',
      });
    }

    return {
      uid: authUser.uid,
      customToken,
      idToken: result.idToken,
      refreshToken: result.refreshToken || null,
      expiresIn: Number(result.expiresIn) || 3600,
    };
  }

  static async createOwner(data) {
    try {
      const authUser = await AuthFirebaseService.createUser({
        displayName: `${(data.firstName || '').trim()} ${(data.lastName || '').trim()}`.trim(),
        photoURL: data.avatar,
        email: data.email,
        password: data.password,
        phoneNumber: data.countryCode + data.phoneNumber,
        emailVerified: true,
        disabled: false,
      })

      const user = {
        id: authUser.uid || null,
        authenticationUid: authUser.uid || null,
        email: authUser.email || data.email,
        fullName: authUser.displayName || null,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        avatar: data.avatar,
        lang: data.lang,
        roles: ['owner'],
        disabled: false,
        accountType: 'owner',
      }

      const batch = await UserRepository.createBatch();
      const record = await UserRepository.create(user, {
        currentUser: user,
        batch: batch
      })
      await UserRepository.commitBatch(batch);

      return record
    } catch (error) {
      throw error
    }
  }
}

module.exports = AuthService;