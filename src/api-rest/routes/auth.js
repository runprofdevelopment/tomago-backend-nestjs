const express = require('express');
const router = express.Router();
const multer = require('multer');
const multParse = multer();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');
const AuthService = require('../../services/auth/authService');
const ErrorHandler = require('../../errors/errorHandler');
const config = require('../../../config')();

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    uid: user.authenticationUid,
    email: user.email,
    id: user.id,
    accountType: user.accountType
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return { accessToken, refreshToken };
};

// Mint a Firebase ID token from a uid
router.post('/token', multParse.none(), async (req, res) => {
  try {
    const uid = req.body.uid || req.query.uid;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'auth/uid-required',
          message: 'uid is required',
        },
      });
    }

    const tokens = await AuthService.createTokenForUid(uid);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error('Create token error:', error);

    const code = error.code || error.errorInfo?.code || 'auth/internal-error';
    const status =
      code === 'auth/user-not-found' ? 404 :
      code === 'auth/user-disabled' ? 401 :
      code === 'auth/uid-required' ? 400 :
      500;

    res.status(status).json({
      success: false,
      error: {
        code,
        message: error.message || 'Failed to create token',
      },
    });
  }
});

router.get('/token/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'auth/uid-required',
          message: 'uid is required',
        },
      });
    }

    const tokens = await AuthService.createTokenForUid(uid);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error('Create token error:', error);

    const code = error.code || error.errorInfo?.code || 'auth/internal-error';
    const status =
      code === 'auth/user-not-found' ? 404 :
      code === 'auth/user-disabled' ? 401 :
      500;

    res.status(status).json({
      success: false,
      error: {
        code,
        message: error.message || 'Failed to create token',
      },
    });
  }
});

// Signup endpoint
router.post('/signup', multParse.none(), async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'auth/invalid-credentials',
          message: 'Email, password, firstName, and lastName are required'
        }
      });
    }

    // Step 1: Create user in Firebase Auth
    let authUser;
    try {
      authUser = await AuthFirebaseService.createUser({
        email: email,
        password: password,
        displayName: `${firstName} ${lastName}`.trim(),
        phoneNumber: phoneNumber || null,
        emailVerified: false,
        disabled: false
      });
    } catch (error) {
      console.error('Firebase Auth creation error:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'auth/email-already-exists',
            message: 'An account with this email already exists'
          }
        });
      } else if (error.code === 'auth/weak-password') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'auth/weak-password',
            message: 'Password is too weak'
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: error.code || 'auth/user-creation-failed',
            message: error.message || 'Failed to create user account'
          }
        });
      }
    }

    // Step 2: Create user in database using AuthService
    let user;
    try {
      user = await AuthService.findOrCreateFromAuth(authUser.uid, {
        language: 'en',
        accountType: 'customer'
      });
    } catch (error) {
      console.error('Database user creation error:', error);
      
      // If database creation fails, delete the Firebase Auth user
      try {
        await AuthFirebaseService.deleteUser(authUser.uid);
      } catch (deleteError) {
        console.error('Failed to delete Firebase Auth user after database error:', deleteError);
      }
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'auth/database-creation-failed',
          message: 'Failed to create user in database'
        }
      });
    }

    // Step 3: Update user with additional data
    try {
      const UserRepository = require('../../database/repositories/userRepository');
      await UserRepository.update(user.id, {
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        phoneNumber: phoneNumber || null,
        accountType: 'customer',
        roles: ['customer']
      }, {
        currentUser: user,
        language: 'en'
      });
      
      // Get updated user data
      user = await UserRepository.findById(user.id);
    } catch (error) {
      console.error('User update error:', error);
      // Don't fail the signup if update fails, just log it
    }

    // Step 4: Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Return success response
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.fullName || user.firstName,
          accountType: user.accountType,
          authenticationUid: user.authenticationUid,
          emailVerified: user.emailVerified || false,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          isAnonymous: false
        },
        accessToken,
        refreshToken,
        expiresIn: 3600 // 1 hour in seconds
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'auth/internal-error',
        message: 'Internal server error'
      }
    });
  }
});

// Login endpoint
router.post('/login', multParse.none(), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'auth/invalid-credentials',
          message: 'Email and password are required'
        }
      });
    }

    // Verify credentials with Firebase Auth REST API
    let authUser;
    try {
      // Use Firebase Auth REST API to verify email/password
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.firebaseConfig.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: false
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return res.status(401).json({
          success: false,
          error: {
            code: result.error?.message || 'auth/invalid-credentials',
            message: 'Invalid credentials'
          }
        });
      }

      // Get user details from Firebase Admin SDK
      authUser = await AuthFirebaseService.getUser(result.localId);
    } catch (error) {
      console.error('Firebase Auth error:', error);
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/invalid-credentials',
          message: 'Invalid credentials'
        }
      });
    }

    // Get user from database
    const user = await AuthService.findFromAuth(authUser.uid);
    
    if (!user || user.disabled) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/user-disabled',
          message: 'User account is disabled'
        }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Return success response
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.fullName || user.firstName,
          accountType: user.accountType,
          authenticationUid: user.authenticationUid,
          emailVerified: user.emailVerified || false,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          isAnonymous: false
        },
        accessToken,
        refreshToken,
        expiresIn: 3600 // 1 hour in seconds
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'auth/internal-error',
        message: 'Internal server error'
      }
    });
  }
});

// Refresh token endpoint
router.post('/refresh', multParse.none(), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'auth/refresh-token-required',
          message: 'Refresh token is required'
        }
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/invalid-refresh-token',
          message: 'Invalid refresh token'
        }
      });
    }

    // Get user from database
    const user = await AuthService.findFromAuth(decoded.uid);
    
    if (!user || user.disabled) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/user-disabled',
          message: 'User account is disabled'
        }
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'auth/internal-error',
        message: 'Internal server error'
      }
    });
  }
});

// Logout endpoint
router.post('/logout', multParse.none(), async (req, res) => {
  try {
    // In a more secure implementation, you might want to blacklist the refresh token
    // For now, we'll just return success as the client will clear localStorage
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'auth/internal-error',
        message: 'Internal server error'
      }
    });
  }
});

// Verify token endpoint (for testing)
router.post('/verify', multParse.none(), async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'auth/token-required',
          message: 'Access token is required'
        }
      });
    }

    // Verify access token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/invalid-token',
          message: 'Invalid or expired token'
        }
      });
    }

    // Get user from database
    const user = await AuthService.findFromAuth(decoded.uid);
    
    if (!user || user.disabled) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'auth/user-disabled',
          message: 'User account is disabled'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.fullName || user.firstName,
          accountType: user.accountType,
          authenticationUid: user.authenticationUid,
          emailVerified: user.emailVerified || false,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          isAnonymous: false
        },
        valid: true
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'auth/internal-error',
        message: 'Internal server error'
      }
    });
  }
});

// Check Firebase Auth verification status
router.post('/check-verification', multParse.none(), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'auth/email-required',
          message: 'Email is required'
        }
      });
    }

    console.log('Checking Firebase Auth verification for:', email);

    // Check Firebase Auth
    let authUser = null;
    let firebaseAuthStatus = {
      exists: false,
      emailVerified: false,
      disabled: false,
      uid: null,
      email: null,
      displayName: null,
      createdAt: null,
      lastSignIn: null
    };

    try {
      authUser = await AuthFirebaseService.getUserByEmail(email);
      firebaseAuthStatus = {
        exists: true,
        emailVerified: authUser.emailVerified,
        disabled: authUser.disabled,
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        createdAt: authUser.metadata.creationTime,
        lastSignIn: authUser.metadata.lastSignInTime
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        firebaseAuthStatus.exists = false;
      } else {
        throw error;
      }
    }

    // Check Database
    let databaseUser = null;
    let databaseStatus = {
      exists: false,
      emailVerified: false,
      disabled: false,
      id: null,
      email: null,
      accountType: null,
      authenticationUid: null,
      createdAt: null,
      updatedAt: null
    };

    try {
      const UserRepository = require('../../database/repositories/userRepository');
      databaseUser = await UserRepository.findByEmail(email);
      if (databaseUser) {
        databaseStatus = {
          exists: true,
          emailVerified: databaseUser.emailVerified,
          disabled: databaseUser.disabled,
          id: databaseUser.id,
          email: databaseUser.email,
          accountType: databaseUser.accountType,
          authenticationUid: databaseUser.authenticationUid,
          createdAt: databaseUser.createdAt,
          updatedAt: databaseUser.updatedAt
        };
      }
    } catch (error) {
      console.error('Database check error:', error);
    }

    // Check sync status
    let syncStatus = {
      inSync: false,
      firebaseVerified: false,
      databaseVerified: false
    };

    if (firebaseAuthStatus.exists && databaseStatus.exists) {
      syncStatus = {
        inSync: firebaseAuthStatus.emailVerified === databaseStatus.emailVerified,
        firebaseVerified: firebaseAuthStatus.emailVerified,
        databaseVerified: databaseStatus.emailVerified
      };
    }

    // Determine overall status
    let overallStatus = 'unknown';
    if (firebaseAuthStatus.exists && databaseStatus.exists) {
      if (firebaseAuthStatus.emailVerified && databaseStatus.emailVerified) {
        overallStatus = 'fully_verified';
      } else if (!firebaseAuthStatus.emailVerified && !databaseStatus.emailVerified) {
        overallStatus = 'not_verified';
      } else {
        overallStatus = 'partially_verified';
      }
    } else if (firebaseAuthStatus.exists) {
      overallStatus = firebaseAuthStatus.emailVerified ? 'firebase_only_verified' : 'firebase_only_not_verified';
    } else if (databaseStatus.exists) {
      overallStatus = databaseStatus.emailVerified ? 'database_only_verified' : 'database_only_not_verified';
    } else {
      overallStatus = 'not_found';
    }

    res.json({
      success: true,
      data: {
        email,
        firebaseAuth: firebaseAuthStatus,
        database: databaseStatus,
        syncStatus,
        overallStatus
      }
    });

  } catch (error) {
    console.error('Check verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'auth/internal-error',
        message: 'Internal server error'
      }
    });
  }
});

// Force sync verification status
router.post('/force-sync-verification', multParse.none(), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'auth/email-required',
          message: 'Email is required'
        }
      });
    }

    console.log('Force syncing verification for:', email);

    // Get user from Firebase Auth
    let authUser = null;
    try {
      authUser = await AuthFirebaseService.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'auth/user-not-found',
            message: 'User not found in Firebase Auth'
          }
        });
      } else {
        throw error;
      }
    }

    // Force sync using EmailVerificationSync service
    const EmailVerificationSync = require('../../services/auth/emailVerificationSync');
    const emailSync = new EmailVerificationSync();
    const syncResult = await emailSync.forceSync(authUser.uid);

    if (syncResult) {
      // Get updated database user
      const UserRepository = require('../../database/repositories/userRepository');
      const updatedDatabaseUser = await UserRepository.findByEmail(email);
      
      res.json({
        success: true,
        data: {
          message: 'Force sync completed successfully',
          syncResult: true,
          firebaseAuth: {
            uid: authUser.uid,
            emailVerified: authUser.emailVerified
          },
          database: updatedDatabaseUser ? {
            id: updatedDatabaseUser.id,
            emailVerified: updatedDatabaseUser.emailVerified
          } : null
        }
      });
    } else {
      res.json({
        success: false,
        data: {
          message: 'Force sync failed',
          syncResult: false
        }
      });
    }

  } catch (error) {
    console.error('Force sync error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'auth/internal-error',
        message: 'Internal server error'
      }
    });
  }
});

// Custom email verification page (Dynalinks destination — no Firebase action link)
router.get('/verify-email', async (req, res) => {
  const EmailVerificationTokenService = require('../../services/auth/emailVerificationTokenService');
  const language =
    (req.query.lang || req.headers['accept-language'] || 'en')
      .toString()
      .toLowerCase()
      .startsWith('ar')
      ? 'ar'
      : 'en';
  const token = req.query.token;

  try {
    await EmailVerificationTokenService.confirmToken(token, language);
    const html = EmailVerificationTokenService.renderResultPage({
      success: true,
      language,
      title: language === 'ar' ? 'تم التحقق' : 'Email verified',
      message:
        language === 'ar'
          ? 'تم التحقق من بريدك الإلكتروني بنجاح. يمكنك إغلاق هذه الصفحة.'
          : 'Your email has been verified successfully. You can close this page.',
    });
    return res.status(200).type('html').send(html);
  } catch (error) {
    const message =
      (error && error.message) ||
      (language === 'ar'
        ? 'تعذر التحقق من البريد الإلكتروني'
        : 'Could not verify your email');
    const html = EmailVerificationTokenService.renderResultPage({
      success: false,
      language,
      title: language === 'ar' ? 'فشل التحقق' : 'Verification failed',
      message,
    });
    return res.status(400).type('html').send(html);
  }
});

module.exports = router; 