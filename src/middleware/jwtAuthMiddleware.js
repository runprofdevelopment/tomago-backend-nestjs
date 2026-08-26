const jwt = require('jsonwebtoken');
const AuthService = require('../services/auth/authService');
const AuthError = require('../errors/authError');
const config = require('../../config')();

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */
module.exports = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow the request to continue without user for public endpoints
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return next();
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw AuthError.tokenExpired(req.language || 'en');
      } else if (error.name === 'JsonWebTokenError') {
        throw AuthError.invalidToken(req.language || 'en');
      } else {
        throw AuthError.internalError(req.language || 'en');
      }
    }

    // Get user from database
    const user = await AuthService.findFromAuth(decoded.uid);
    
    if (!user) {
      throw AuthError.userNotFound(req.language || 'en');
    }

    if (user.disabled) {
      throw AuthError.userDisabled(req.language || 'en');
    }

    // Attach user to request
    req.currentUser = user;
    req.jwtPayload = decoded;

    return next();

  } catch (error) {
    // Handle AuthError specifically
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    // Handle other errors
    console.error('JWT Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'auth/internal-error',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * Required JWT Authentication Middleware
 * Ensures user is authenticated before proceeding
 */
module.exports.requireAuth = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AuthError.invalidToken(req.language || 'en');
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw AuthError.invalidToken(req.language || 'en');
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw AuthError.tokenExpired(req.language || 'en');
      } else if (error.name === 'JsonWebTokenError') {
        throw AuthError.invalidToken(req.language || 'en');
      } else {
        throw AuthError.internalError(req.language || 'en');
      }
    }

    // Get user from database
    const user = await AuthService.findFromAuth(decoded.uid);
    
    if (!user) {
      throw AuthError.userNotFound(req.language || 'en');
    }

    if (user.disabled) {
      throw AuthError.userDisabled(req.language || 'en');
    }

    // Attach user to request
    req.currentUser = user;
    req.jwtPayload = decoded;

    return next();

  } catch (error) {
    // Handle AuthError specifically
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    // Handle other errors
    console.error('Required JWT Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'auth/internal-error',
        message: 'Internal server error'
      }
    });
  }
}; 