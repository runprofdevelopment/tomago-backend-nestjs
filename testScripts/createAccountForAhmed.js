const AuthFirebaseService = require('../src/infrastructure/auth/authFirebaseService');
const AuthService = require('../src/services/auth/authService');
const config = require('../config')();

/**
 * Script to check and create account for ahmeddarweesh@runprof.com
 * --------------------------------------------------------------
 * This script will:
 * 1. Check if the user exists in Firebase Auth
 * 2. Create the user if it doesn't exist
 * 3. Create the user in the database
 * 4. Set up proper roles and permissions
 */

const TARGET_EMAIL = 'ahmeddarweesh@runprof.com';
const TARGET_PASSWORD = 'Ahmed@2024'; // You should change this to a secure password
const TARGET_DISPLAY_NAME = 'Ahmed Darweesh';

async function checkAndCreateAccount() {
  console.log('🔍 Checking account for:', TARGET_EMAIL);
  
  try {
    // Step 1: Check if user exists in Firebase Auth
    let authUser = null;
    try {
      authUser = await AuthFirebaseService.getUserByEmail(TARGET_EMAIL);
      console.log('✅ User already exists in Firebase Auth:', authUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ User not found in Firebase Auth, creating...');
        
        // Create user in Firebase Auth
        authUser = await AuthFirebaseService.createUser({
          email: TARGET_EMAIL,
          password: TARGET_PASSWORD,
          displayName: TARGET_DISPLAY_NAME,
          photoURL: '',
          emailVerified: true,
          disabled: false,
        });
        
        console.log('✅ User created in Firebase Auth:', authUser.uid);
      } else {
        throw error;
      }
    }

    // Step 2: Check if user exists in database
    let databaseUser = null;
    try {
      databaseUser = await AuthService.findOrCreateFromAuth(authUser.uid, {
        language: 'en',
        accountType: 'customer'
      });
      
      if (databaseUser) {
        console.log('✅ User exists in database:', databaseUser.id);
        
        // Update user with additional information
        const UserRepository = require('../src/database/repositories/userRepository');
        await UserRepository.update(databaseUser.id, {
          firstName: 'Ahmed',
          lastName: 'Darweesh',
          fullName: TARGET_DISPLAY_NAME,
          accountType: 'customer',
          roles: ['customer'],
          emailVerified: true,
          disabled: false
        }, {
          currentUser: databaseUser,
          language: 'en'
        });
        
        console.log('✅ User updated in database');
      }
    } catch (error) {
      console.error('❌ Error with database user:', error);
      throw error;
    }

    // Step 3: Verify the account is working
    console.log('\n📋 Account Summary:');
    console.log('   Email:', TARGET_EMAIL);
    console.log('   Firebase UID:', authUser.uid);
    console.log('   Database ID:', databaseUser?.id);
    console.log('   Display Name:', TARGET_DISPLAY_NAME);
    console.log('   Account Type:', databaseUser?.accountType);
    console.log('   Roles:', databaseUser?.roles);
    console.log('   Email Verified:', authUser.emailVerified);
    console.log('   Disabled:', authUser.disabled);

    console.log('\n🎉 Account setup completed successfully!');
    console.log('   You can now use this account to test the application.');
    
  } catch (error) {
    console.error('❌ Error creating account:', error);
    process.exit(1);
  }
}

// Run the script
checkAndCreateAccount(); 