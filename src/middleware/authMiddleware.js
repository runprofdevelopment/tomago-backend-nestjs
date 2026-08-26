const colors = require('colors');
const AuthFirebaseService = require('../infrastructure/auth/authFirebaseService');
const AuthService = require('../services/auth/authService');
const config = require('../../config')();
const Utils = require('./utils');
const ErrorHandler = require('../errors/errorHandler');
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

  const isPostmanPlatform = `${req.useragent}`.includes('Postman');

  if (isTokenEmpty && isPostmanPlatform) {
    return authenticateWithTestUserIfExists(req, res, next);
  }

  let idToken;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1]; // Read the ID Token from the Authorization header.
  } else if (req.cookies) {
    idToken = req.cookies.__session; // Read the ID Token from cookie.
  }

  try {
    // const requestedFrom = Utils.verifyAppId(req.appId);
    // Utils.verifyPlatform(req.platform);

    const operationNames = req.operationNames || [];
    if (operationNames.length && !idToken) {
      const isPublicEndpoints = Utils.checkEndpointIsPublic(operationNames);
      if (isPublicEndpoints) return next();
    }

    if (!idToken) {
      throw new ErrorHandler({
        errorCode: 'auth/id-token-required',
        message: 'idToken must be provided in Authorization header or cookie',
      });
    }

    const { uid } = await AuthFirebaseService.verifyIdToken(idToken);

    // const currentUser = await handlerCurrentUser(requestedFrom, uid, req.language);
    const currentUser = await AuthService.findFromAuth(uid);

    // if (req.operationType == 'mutation' && currentUser.providerId == 'anonymous') {
    //   throw new Error(`The user is logged in anonymously`);
    // }

    if (currentUser.disabled) {
      throw new Error(`User '${currentUser.email}' is disabled`);
    }

    req.currentUser = currentUser;

    return next();
  } catch (error) {
    const isIntrospection =
      req.body?.operationName === 'IntrospectionQuery' ||
      (req.operationNames || []).includes('__schema');

    if (!isIntrospection) {
      console.error(colors.red('\nError while verifying Firebase ID token:'), {
        code: error.code,
        message: error.message,
        stack: error.stack,
      }, '\n');

      console.error('Request context:', {
        headers: req.headers,
        operationNames: req.operationNames,
        operationType: req.operationType,
      });
    }

    handlerError(error, res);
  }
};

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

  let authUser = null;

  try {
    try {
      authUser = await AuthFirebaseService.getUserByEmail(
        userAutoAuthenticatedEmailForTests,
      );
    } catch (error) {
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
  }
}

async function handlerError(error, res) {
  switch (error.code) {
    case 'auth/user-not-found': case 'auth/id-token-required':
      res.status(401).send({ status: 'Unauthorized', code: error.code, message: error.message });
      break;
    case 'auth/id-token-expired': case 'auth/token-expired':
      res.status(403).send({ status: 'Forbidden', code: error.code, message: error.message });
      break;
    default:
      res.status(403).send({ status: 'Forbidden', code: error.code, message: error.message });
      break;
  }
  // res.status(403).send({ status: 'Unauthorized', code: error.code, message: error.message });
  // res.status(403).send('Unauthorized');
}