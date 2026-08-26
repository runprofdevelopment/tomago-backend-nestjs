const AuthFirebaseService = require('../src/infrastructure/auth/authFirebaseService');
const AuthService = require('../src/services/auth/authService');
const UserRepository = require('../src/database/repositories/userRepository');

/**
 * Script to check account status for ahmeddarweesh@runprof.com
 * -----------------------------------------------------------
 * This script will check:
 * 1. Firebase Auth status
 * 2. Database status
 * 3. Account permissions and roles
 */

const TARGET_EMAIL = 'ahmeddarweesh@runprof.com';

async function checkAccountStatus() {
  console.log('🔍 Checking account status for:', TARGET_EMAIL);
  
  try {
    // Step 1: Check Firebase Auth
    console.log('\n📱 Firebase Auth Status:');
    try {
      const authUser = await AuthFirebaseService.getUserByEmail(TARGET_EMAIL);
      console.log('   ✅ User exists in Firebase Auth');
      console.log('   UID:', authUser.uid);
      console.log('   Email Verified:', authUser.emailVerified);
      console.log('   Disabled:', authUser.disabled);
      console.log('   Display Name:', authUser.displayName);
      console.log('   Created At:', authUser.metadata.creationTime);
      console.log('   Last Sign In:', authUser.metadata.lastSignInTime);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('   ❌ User not found in Firebase Auth');
        return;
      } else {
        throw error;
      }
    }

    // Step 2: Check Database
    console.log('\n🗄️  Database Status:');
    try {
      const authUser = await AuthFirebaseService.getUserByEmail(TARGET_EMAIL);
      const databaseUser = await AuthService.findFromAuth(authUser.uid);
      
      if (databaseUser) {
        console.log('   ✅ User exists in database');
        console.log('   Database ID:', databaseUser.id);
        console.log('   Account Type:', databaseUser.accountType);
        console.log('   Roles:', databaseUser.roles);
        console.log('   First Name:', databaseUser.firstName);
        console.log('   Last Name:', databaseUser.lastName);
        console.log('   Full Name:', databaseUser.fullName);
        console.log('   Email:', databaseUser.email);
        console.log('   Phone Number:', databaseUser.phoneNumber);
        console.log('   Created At:', databaseUser.createdAt);
        console.log('   Updated At:', databaseUser.updatedAt);
        console.log('   Disabled:', databaseUser.disabled);
      } else {
        console.log('   ❌ User not found in database');
      }
    } catch (error) {
      console.log('   ❌ Error checking database:', error.message);
    }

    // Step 3: Check by email directly
    console.log('\n🔎 Direct Email Search:');
    try {
      const usersByEmail = await UserRepository.findByEmailOrPhone(TARGET_EMAIL);
      if (usersByEmail) {
        console.log('   ✅ Found user by email search');
        console.log('   ID:', usersByEmail.id);
        console.log('   Account Type:', usersByEmail.accountType);
      } else {
        console.log('   ❌ No user found by email search');
      }
    } catch (error) {
      console.log('   ❌ Error in email search:', error.message);
    }

    // Step 4: Test authentication
    console.log('\n🔐 Authentication Test:');
    try {
      const authUser = await AuthFirebaseService.getUserByEmail(TARGET_EMAIL);
      const databaseUser = await AuthService.findFromAuth(authUser.uid);
      
      if (databaseUser && !databaseUser.disabled) {
        console.log('   ✅ Authentication would succeed');
        console.log('   User is active and can authenticate');
      } else if (databaseUser && databaseUser.disabled) {
        console.log('   ⚠️  User exists but is disabled');
      } else {
        console.log('   ❌ Authentication would fail - user not in database');
      }
    } catch (error) {
      console.log('   ❌ Authentication test failed:', error.message);
    }

    console.log('\n📋 Summary:');
    console.log('   If all checks show ✅, the account is ready to use');
    console.log('   If any checks show ❌, run the createAccountForAhmed.js script');
    
  } catch (error) {
    console.error('❌ Error checking account status:', error);
    process.exit(1);
  }
}

// Run the script
checkAccountStatus(); 