const colors = require('colors');
const AuthFirebaseService = require('../infrastructure/auth/authFirebaseService');
const AuthService = require('../services/auth/authService');
const config = require('../../config')();
const Utils = require('./utils');
// const HeaderMiddleware = require('./headerMiddleware');
// const AuthenticateWithTestUserIfExists = require('./authenticateWithTestUserIfExists');

/**
 * Authenticates and fills the request with the user if it exists.
 * If no token is passed, it continues the request but without filling the currentUser.
 * If userAutoAuthenticatedEmailForTests exists and no token is passed, it fills with this user for tests.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
module.exports = async (req, res, next) => {
  const isTokenEmpty =
    (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session);

  if (isTokenEmpty) {
    return authenticateWithTestUserIfExists(req, res, next);
  }

  let idToken;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1]; // Read the ID Token from the Authorization header.
  } else if (req.cookies) {
    idToken = req.cookies.__session; // Read the ID Token from cookie.
  }

  try {
    const requestedFrom = Utils.verifyAppId(req.appId);

    const operationNames = req.operationNames || [];
    if (operationNames.length && !idToken) {
      const isPublicEndpoints = Utils.checkEndpointIsPublic(operationNames);
      if (isPublicEndpoints) return next();
    }

    const { uid } = await AuthFirebaseService.verifyIdToken(idToken);

    const currentUser = await handlerCurrentUser(requestedFrom, uid, req.language);

    if (req.operationType == 'mutation' && currentUser.providerId == 'anonymous') {
      throw new Error(`The user is logged in anonymously`);
    }

    if (currentUser.disabled) {
      throw new Error(`User '${currentUser.email}' is disabled`);
    }

    req.currentUser = currentUser;

    return next();
  } catch (error) {
    console.error(colors.red('\nError while verifying Firebase ID token:'), { code: error.code, message: error.message }, '\n');
    handlerError(error, res);
  }
};

async function handlerCurrentUser(requestedFrom, uid, language) {
  const accountType = requestedFrom == 'dashboard' 
    ? 'admin' 
    : requestedFrom == 'website' ? 'customer' : null;

  if (accountType) {
    const currentUser = await AuthService.findOrCreateFromAuth(uid, {
      accountType: accountType,
      language: language,
    });
    return currentUser;
  } else {
    const currentUser = await AuthService.findFromAuth(uid);
    return currentUser;
  }

  // if (requestedFrom == 'dashboard') {
  //   const currentUser = await AuthService.findOrCreateFromAuth(uid, {
  //     accountType: 'admin',
  //     language: language,
  //   });
  //   return currentUser;
  // } else if (requestedFrom == 'website') {
  //   const currentUser = await AuthService.findOrCreateFromAuth(uid, {
  //     accountType: 'customer',
  //     language: language,
  //   });
  //   return currentUser;
  // } else {
  //   const currentUser = await AuthService.findFromAuth(uid);
  //   return currentUser;
  // }
}

/**
 * Fills the request with the authenticateWithTestUser in case it exists.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function authenticateWithTestUserIfExists(req, res, next) {
  const userAutoAuthenticatedEmailForTests = config && config.userAutoAuthenticatedEmailForTests;

  if (!userAutoAuthenticatedEmailForTests) {
    return next();
  }

  try {
    let authUser = await AuthFirebaseService.getUserByEmail(
      userAutoAuthenticatedEmailForTests,
    );

    if (!authUser) {
      authUser = await AuthFirebaseService.createUser({
        email: userAutoAuthenticatedEmailForTests, 
        password: '12345678', 
        displayName: 'Default User for Tests', 
        photoURL: '', 
        // phoneNumber: '', 
        emailVerified: false, 
        disabled: false,
      });
    }

    console.log(`Authenticated with default user: ${userAutoAuthenticatedEmailForTests}`);

    const currentUser = await AuthService.findOrCreateFromAuth(
      authUser.uid,
    );

    if (currentUser.disabled) {
      throw new Error(`User '${currentUser.email}' is disabled`);
    }

    req.currentUser = currentUser;

    return next();
  } catch (error) {
    console.error(colors.red(`Error while authenticating with default user: ${userAutoAuthenticatedEmailForTests}:`), error, '\n');
    handlerError(error, res);
    // res.status(403).send('Unauthorized');
    // return;
  }
}

async function handlerError(error, res) {
  if (error.code === 'auth/user-not-found') {
    res.status(401).send({ status: 'Unauthorized', code: error.code, message: error.message });
  } else { // 'auth/id-token-expired' || 'auth/token-expired'
    res.status(403).send({ status: 'Forbidden', code: error.code, message: error.message });
  }
  // res.status(403).send({ status: 'Unauthorized', code: error.code, message: error.message });
  // res.status(403).send('Unauthorized');
}
