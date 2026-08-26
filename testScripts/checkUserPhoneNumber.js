const admin = require('firebase-admin');
const config = require('../config')();

// Initialize Firebase Admin
const serviceAccount = require('../service-accounts/localhost.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebaseConfig.databaseURL,
});

const TARGET_USER_ID = 'LFlqDo1fScVNE3XDINA4oftRgXE2';

async function checkAndFixUserPhoneNumber() {
  try {
    console.log('🔍 Checking user data for ID:', TARGET_USER_ID);
    
    // Get user document from Firestore
    const userDoc = await admin.firestore().collection('user').doc(TARGET_USER_ID).get();
    
    if (!userDoc.exists) {
      console.log('❌ User document does not exist');
      return;
    }
    
    const userData = userDoc.data();
    console.log('📋 User data:', userData);
    
    // Check if phoneNumber exists
    if (!userData.phoneNumber) {
      console.log('❌ No phone number found for user');
      console.log('💡 To fix this, you need to:');
      console.log('   1. Go to the account page');
      console.log('   2. Add a phone number to your profile');
      console.log('   3. Then try the phone verification again');
      return;
    }
    
    console.log('✅ Phone number found:', userData.phoneNumber);
    console.log('📱 Phone verified:', userData.phoneVerified || false);
    
    // Check if phone is verified
    if (!userData.phoneVerified) {
      console.log('⚠️  Phone number is not verified');
      console.log('💡 You can verify it through the account page');
    } else {
      console.log('✅ Phone number is already verified');
    }
    
  } catch (error) {
    console.error('❌ Error checking user data:', error);
  } finally {
    process.exit(0);
  }
}

checkAndFixUserPhoneNumber();

