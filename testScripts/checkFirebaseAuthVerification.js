const AuthFirebaseService = require('../src/infrastructure/auth/authFirebaseService');
const AuthService = require('../src/services/auth/authService');
const UserRepository = require('../src/database/repositories/userRepository');
const EmailVerificationSync = require('../src/services/auth/emailVerificationSync');

/**
 * Script to check Firebase Authentication table for email verification status
 * -------------------------------------------------------------------------
 * This script will check:
 * 1. Firebase Auth email verification status
 * 2. Database email verification status
 * 3. Sync status between Firebase Auth and Database
 * 4. Force sync if needed
 */

// You can change this to check any email
const TARGET_EMAIL = process.argv[2] || 'ahmeddarweesh@runprof.com';

async function checkFirebaseAuthVerification() {
  console.log('🔍 Checking Firebase Auth verification for:', TARGET_EMAIL);
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Check Firebase Auth
    console.log('\n📱 Firebase Auth Status:');
    let authUser = null;
    try {
      authUser = await AuthFirebaseService.getUserByEmail(TARGET_EMAIL);
      console.log('   ✅ User exists in Firebase Auth');
      console.log('   UID:', authUser.uid);
      console.log('   Email:', authUser.email);
      console.log('   Email Verified:', authUser.emailVerified ? '✅ YES' : '❌ NO');
      console.log('   Disabled:', authUser.disabled ? '❌ YES' : '✅ NO');
      console.log('   Display Name:', authUser.displayName || 'N/A');
      console.log('   Created At:', authUser.metadata.creationTime);
      console.log('   Last Sign In:', authUser.metadata.lastSignInTime);
      console.log('   Provider Data:', authUser.providerData.map(p => p.providerId).join(', '));
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('   ❌ User not found in Firebase Auth');
        console.log('   Error:', error.message);
        return;
      } else {
        console.log('   ❌ Error checking Firebase Auth:', error.message);
        return;
      }
    }

    // Step 2: Check Database
    console.log('\n🗄️  Database Status:');
    let databaseUser = null;
    try {
      databaseUser = await UserRepository.findByEmail(TARGET_EMAIL);
      
      if (databaseUser) {
        console.log('   ✅ User exists in database');
        console.log('   Database ID:', databaseUser.id);
        console.log('   Email:', databaseUser.email);
        console.log('   Email Verified:', databaseUser.emailVerified ? '✅ YES' : '❌ NO');
        console.log('   Account Type:', databaseUser.accountType);
        console.log('   Authentication UID:', databaseUser.authenticationUid);
        console.log('   Created At:', databaseUser.createdAt);
        console.log('   Updated At:', databaseUser.updatedAt);
        console.log('   Disabled:', databaseUser.disabled ? '❌ YES' : '✅ NO');
      } else {
        console.log('   ❌ User not found in database');
      }
    } catch (error) {
      console.log('   ❌ Error checking database:', error.message);
    }

    // Step 3: Check Sync Status
    console.log('\n🔄 Sync Status:');
    if (authUser && databaseUser) {
      const firebaseVerified = authUser.emailVerified;
      const databaseVerified = databaseUser.emailVerified;
      
      console.log('   Firebase Auth emailVerified:', firebaseVerified);
      console.log('   Database emailVerified:', databaseVerified);
      
      if (firebaseVerified === databaseVerified) {
        console.log('   ✅ Firebase Auth and Database are in sync');
      } else {
        console.log('   ❌ Firebase Auth and Database are OUT OF SYNC');
        console.log('   🔧 Attempting to sync...');
        
        try {
          const emailSync = new EmailVerificationSync();
          const syncResult = await emailSync.forceSync(authUser.uid);
          
          if (syncResult) {
            console.log('   ✅ Sync completed successfully');
          } else {
            console.log('   ❌ Sync failed');
          }
        } catch (syncError) {
          console.log('   ❌ Error during sync:', syncError.message);
        }
      }
    } else {
      console.log('   ⚠️  Cannot check sync status - missing data');
    }

    // Step 4: Check via AuthService
    console.log('\n🔐 AuthService Check:');
    try {
      const authServiceUser = await AuthService.findFromAuth(authUser.uid);
      console.log('   ✅ AuthService found user');
      console.log('   ID:', authServiceUser.id);
      console.log('   Email:', authServiceUser.email);
      console.log('   Email Verified:', authServiceUser.emailVerified ? '✅ YES' : '❌ NO');
      console.log('   Account Type:', authServiceUser.accountType);
      console.log('   Authentication UID:', authServiceUser.authenticationUid);
    } catch (error) {
      console.log('   ❌ AuthService error:', error.message);
    }

    // Step 5: Summary
    console.log('\n📋 Summary:');
    if (authUser) {
      console.log('   Firebase Auth Status:', authUser.emailVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED');
    }
    if (databaseUser) {
      console.log('   Database Status:', databaseUser.emailVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED');
    }
    
    if (authUser && databaseUser) {
      if (authUser.emailVerified && databaseUser.emailVerified) {
        console.log('   Overall Status: ✅ FULLY VERIFIED');
      } else if (!authUser.emailVerified && !databaseUser.emailVerified) {
        console.log('   Overall Status: ❌ NOT VERIFIED');
      } else {
        console.log('   Overall Status: ⚠️  PARTIALLY VERIFIED (SYNC ISSUE)');
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Function to check multiple emails
async function checkMultipleEmails(emails) {
  console.log('🔍 Checking multiple emails for verification status');
  console.log('=' .repeat(60));
  
  for (const email of emails) {
    console.log(`\n📧 Checking: ${email}`);
    console.log('-'.repeat(40));
    
    try {
      const authUser = await AuthFirebaseService.getUserByEmail(email);
      console.log(`   Firebase Auth: ${authUser.emailVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}`);
      
      const databaseUser = await UserRepository.findByEmail(email);
      if (databaseUser) {
        console.log(`   Database: ${databaseUser.emailVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}`);
      } else {
        console.log('   Database: ❌ NOT FOUND');
      }
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('   ❌ User not found in Firebase Auth');
      } else {
        console.log('   ❌ Error:', error.message);
      }
    }
  }
}

// Function to force sync verification status
async function forceSyncVerification(email) {
  console.log('🔄 Force syncing verification status for:', email);
  console.log('=' .repeat(60));
  
  try {
    const authUser = await AuthFirebaseService.getUserByEmail(email);
    console.log('   Firebase Auth UID:', authUser.uid);
    console.log('   Firebase Auth emailVerified:', authUser.emailVerified);
    
    const emailSync = new EmailVerificationSync();
    const syncResult = await emailSync.forceSync(authUser.uid);
    
    if (syncResult) {
      console.log('   ✅ Force sync completed successfully');
      
      // Check result
      const updatedDatabaseUser = await UserRepository.findByEmail(email);
      if (updatedDatabaseUser) {
        console.log('   Updated Database emailVerified:', updatedDatabaseUser.emailVerified);
      }
    } else {
      console.log('   ❌ Force sync failed');
    }
    
  } catch (error) {
    console.error('   ❌ Error during force sync:', error.message);
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[3] || 'check';
  
  switch (command) {
    case 'check':
      checkFirebaseAuthVerification();
      break;
    case 'multiple':
      const emails = process.argv.slice(4);
      if (emails.length === 0) {
        console.log('Usage: node checkFirebaseAuthVerification.js <email> multiple <email1> <email2> ...');
        process.exit(1);
      }
      checkMultipleEmails(emails);
      break;
    case 'sync':
      forceSyncVerification(TARGET_EMAIL);
      break;
    default:
      console.log('Usage:');
      console.log('  node checkFirebaseAuthVerification.js <email> check     - Check single email');
      console.log('  node checkFirebaseAuthVerification.js <email> multiple <email1> <email2> ... - Check multiple emails');
      console.log('  node checkFirebaseAuthVerification.js <email> sync      - Force sync verification status');
      break;
  }
}

module.exports = {
  checkFirebaseAuthVerification,
  checkMultipleEmails,
  forceSyncVerification
};
