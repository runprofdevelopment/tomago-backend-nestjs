const admin = require('firebase-admin');
const config = require('../config')();

// Initialize Firebase Admin
const serviceAccount = require('../service-accounts/localhost.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebaseConfig.databaseURL,
});

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for phone verification testing...');
    
    const testEmail = 'test@decoopa.com';
    const testPassword = 'TestPassword123!';
    const testPhoneNumber = '+201234567890';
    
    // Check if user already exists in Firebase Auth
    let authUser;
    try {
      authUser = await admin.auth().getUserByEmail(testEmail);
      console.log('✅ User already exists in Firebase Auth:', authUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('📝 Creating new user in Firebase Auth...');
        
        // Create user in Firebase Auth
        authUser = await admin.auth().createUser({
          email: testEmail,
          password: testPassword,
          displayName: 'Test User',
          phoneNumber: testPhoneNumber,
          emailVerified: true,
          disabled: false
        });
        
        console.log('✅ User created in Firebase Auth:', authUser.uid);
      } else {
        throw error;
      }
    }
    
    // Check if user document exists in Firestore
    const userDoc = await admin.firestore().collection('user').doc(authUser.uid).get();
    
    if (userDoc.exists) {
      console.log('✅ User document already exists in Firestore');
      const userData = userDoc.data();
      console.log('📋 Current user data:', userData);
      
      // Update phone number if needed
      if (userData.phoneNumber !== testPhoneNumber) {
        console.log('📱 Updating phone number...');
        await admin.firestore().collection('user').doc(authUser.uid).update({
          phoneNumber: testPhoneNumber,
          phoneVerified: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: authUser.uid
        });
        console.log('✅ Phone number updated');
      }
    } else {
      console.log('📝 Creating user document in Firestore...');
      
      const userData = {
        id: authUser.uid,
        authenticationUid: authUser.uid,
        email: testEmail,
        emailVerified: true,
        phoneNumber: testPhoneNumber,
        phoneVerified: false,
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        disabled: false,
        roles: ['customer'],
        accountType: 'customer',
        providerId: 'password',
        lang: 'en',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: authUser.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: authUser.uid
      };
      
      await admin.firestore().collection('user').doc(authUser.uid).set(userData);
      console.log('✅ User document created in Firestore');
    }
    
    console.log('\n🎉 Test user ready for phone verification testing!');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('📱 Phone:', testPhoneNumber);
    console.log('🆔 User ID:', authUser.uid);
    console.log('\n💡 You can now:');
    console.log('   1. Login with this account');
    console.log('   2. Go to account page');
    console.log('   3. Try phone verification');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();

