const admin = require('firebase-admin');
const config = require('../config')();

// Initialize Firebase Admin
const serviceAccount = require('../service-accounts/localhost.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebaseConfig.databaseURL,
});

const TEST_USER_ID = 'Bb2k1pLUcAad3CscRasmUA6huxc2';

async function testPhoneVerification() {
  try {
    console.log('🧪 Testing phone verification flow...');
    
    // 1. Check if user exists
    const userDoc = await admin.firestore().collection('user').doc(TEST_USER_ID).get();
    if (!userDoc.exists) {
      console.log('❌ Test user does not exist');
      return;
    }
    
    const userData = userDoc.data();
    console.log('📋 User data:', {
      id: userData.id,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      phoneVerified: userData.phoneVerified
    });
    
    // 2. Check if there's an existing OTP entry
    const otpDoc = await admin.firestore().collection('OTP-code').doc(TEST_USER_ID).get();
    if (otpDoc.exists) {
      console.log('📱 Existing OTP entry found');
      const otpData = otpDoc.data();
      console.log('OTP data:', {
        otpCode: otpData.otpCode,
        phoneNumber: otpData.phoneNumber,
        documentRef: otpData.documentRef,
        expirationTime: new Date(otpData.expirationTime)
      });
      
      // Check if OTP is expired
      if (Date.now() > otpData.expirationTime) {
        console.log('⏰ OTP is expired');
      } else {
        console.log('✅ OTP is still valid');
      }
    } else {
      console.log('📱 No existing OTP entry found');
    }
    
    // 3. Simulate OTP verification
    if (otpDoc.exists) {
      const otpData = otpDoc.data();
      
      if (Date.now() <= otpData.expirationTime) {
        console.log('🔐 Simulating OTP verification...');
        
        const batch = admin.firestore().batch();
        
        // Update user document
        const userRef = admin.firestore().collection('user').doc(TEST_USER_ID);
        batch.update(userRef, { 
          phoneVerified: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: TEST_USER_ID
        });
        
        // Delete OTP entry
        const otpRef = admin.firestore().collection('OTP-code').doc(TEST_USER_ID);
        batch.delete(otpRef);
        
        await batch.commit();
        
        console.log('✅ Phone verification completed');
        
        // Verify the update
        const updatedUserDoc = await admin.firestore().collection('user').doc(TEST_USER_ID).get();
        const updatedUserData = updatedUserDoc.data();
        console.log('📋 Updated user data:', {
          phoneVerified: updatedUserData.phoneVerified,
          updatedAt: updatedUserData.updatedAt
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing phone verification:', error);
  } finally {
    process.exit(0);
  }
}

testPhoneVerification();

