const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');
const UserRepository = require('../../database/repositories/userRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');

class EmailVerificationSync {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
  }

  /**
   * Sync email verification status from Firebase Auth to database
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} - True if sync was successful
   */
  async syncFromFirebase(userId) {
    try {
      console.log('EmailVerificationSync: Syncing verification status for user:', userId);
      
      // Get user from Firebase Auth
      const authUser = await AuthFirebaseService.getUser(userId);
      if (!authUser) {
        console.error('EmailVerificationSync: User not found in Firebase Auth:', userId);
        return false;
      }

      console.log('EmailVerificationSync: Firebase Auth user emailVerified:', authUser.emailVerified);
      
      // Get user from database
      const dbUser = await UserRepository.findById(userId);
      if (!dbUser) {
        console.error('EmailVerificationSync: User not found in database:', userId);
        return false;
      }

      console.log('EmailVerificationSync: Database user emailVerified:', dbUser.emailVerified);
      
      // Check if verification status needs to be updated
      if (authUser.emailVerified !== dbUser.emailVerified) {
        console.log('EmailVerificationSync: Verification status mismatch, updating database');
        
        const batch = await FirebaseHelper.createBatch();
        
        await UserRepository.update(userId, {
          emailVerified: authUser.emailVerified,
          updatedAt: FirebaseHelper.serverTimestamp(),
          updatedBy: userId
        }, {
          currentUser: this.currentUser || dbUser,
          language: this.language || 'en',
          batch
        });
        
        await FirebaseHelper.commitBatch(batch);
        
        console.log('EmailVerificationSync: Database updated successfully');
        return true;
      }
      
      console.log('EmailVerificationSync: Verification status already in sync');
      return true;
    } catch (error) {
      console.error('EmailVerificationSync: Error syncing verification status:', error);
      return false;
    }
  }

  /**
   * Sync email verification status from database to Firebase Auth
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} - True if sync was successful
   */
  async syncToFirebase(userId) {
    try {
      console.log('EmailVerificationSync: Syncing verification status to Firebase for user:', userId);
      
      // Get user from database
      const dbUser = await UserRepository.findById(userId);
      if (!dbUser) {
        console.error('EmailVerificationSync: User not found in database:', userId);
        return false;
      }

      console.log('EmailVerificationSync: Database user emailVerified:', dbUser.emailVerified);
      
      // Get user from Firebase Auth
      const authUser = await AuthFirebaseService.getUser(userId);
      if (!authUser) {
        console.error('EmailVerificationSync: User not found in Firebase Auth:', userId);
        return false;
      }

      console.log('EmailVerificationSync: Firebase Auth user emailVerified:', authUser.emailVerified);
      
      // Check if verification status needs to be updated
      if (dbUser.emailVerified !== authUser.emailVerified) {
        console.log('EmailVerificationSync: Verification status mismatch, updating Firebase Auth');
        
        await AuthFirebaseService.updateUser(userId, {
          emailVerified: dbUser.emailVerified
        });
        
        console.log('EmailVerificationSync: Firebase Auth updated successfully');
        return true;
      }
      
      console.log('EmailVerificationSync: Verification status already in sync');
      return true;
    } catch (error) {
      console.error('EmailVerificationSync: Error syncing verification status to Firebase:', error);
      return false;
    }
  }

  /**
   * Force sync verification status for a user
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} - True if sync was successful
   */
  async forceSync(userId) {
    try {
      console.log('EmailVerificationSync: Force syncing verification status for user:', userId);
      
      // Get user from database
      const dbUser = await UserRepository.findById(userId);
      if (!dbUser) {
        console.error('EmailVerificationSync: User not found in database:', userId);
        return false;
      }

      // Get user from Firebase Auth
      const authUser = await AuthFirebaseService.getUser(userId);
      if (!authUser) {
        console.error('EmailVerificationSync: User not found in Firebase Auth:', userId);
        return false;
      }

      // Use Firebase Auth status as the source of truth
      const shouldBeVerified = authUser.emailVerified;
      
      if (dbUser.emailVerified !== shouldBeVerified) {
        console.log('EmailVerificationSync: Updating database to match Firebase Auth');
        
        const batch = await FirebaseHelper.createBatch();
        
        await UserRepository.update(userId, {
          emailVerified: shouldBeVerified,
          updatedAt: FirebaseHelper.serverTimestamp(),
          updatedBy: userId
        }, {
          currentUser: this.currentUser || dbUser,
          language: this.language || 'en',
          batch
        });
        
        await FirebaseHelper.commitBatch(batch);
        
        console.log('EmailVerificationSync: Force sync completed successfully');
        return true;
      }
      
      console.log('EmailVerificationSync: Force sync - no changes needed');
      return true;
    } catch (error) {
      console.error('EmailVerificationSync: Error during force sync:', error);
      return false;
    }
  }
}

module.exports = EmailVerificationSync; 