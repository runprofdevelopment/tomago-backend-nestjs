const admin = require('firebase-admin');
const config = require('../config')();

// Initialize Firebase Admin
const serviceAccount = require('../service-accounts/localhost.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebaseConfig.databaseURL,
});

const TARGET_USER_ID = 'LFlqDo1fScVNE3XDINA4oftRgXE2';

async function fixMissingUserDocument() {
  try {
    console.log('🔍 Checking if user document exists for ID:', TARGET_USER_ID);
    
    // Get user document from Firestore
    const userDoc = await admin.firestore().collection('user').doc(TARGET_USER_ID).get();
    
    if (userDoc.exists) {
      console.log('✅ User document already exists');
      const userData = userDoc.data();
      console.log('📋 User data:', userData);
      return;
    }
    
    console.log('❌ User document does not exist, creating it...');
    
    // Get user from Firebase Auth
    const authUser = await admin.auth().getUser(TARGET_USER_ID);
    console.log('📧 Firebase Auth user:', {
      uid: authUser.uid,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
      displayName: authUser.displayName,
      phoneNumber: authUser.phoneNumber
    });
    
    // Create user document in Firestore
    const userData = {
      id: authUser.uid,
      authenticationUid: authUser.uid,
      email: authUser.email,
      emailVerified: authUser.emailVerified || false,
      phoneNumber: authUser.phoneNumber || null,
      phoneVerified: false,
      firstName: authUser.displayName ? authUser.displayName.split(' ')[0] : null,
      lastName: authUser.displayName ? authUser.displayName.split(' ').slice(1).join(' ') : null,
      fullName: authUser.displayName || null,
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
    
    console.log('📝 Creating user document with data:', userData);
    
    await admin.firestore().collection('user').doc(TARGET_USER_ID).set(userData);
    
    console.log('✅ User document created successfully');
    
    // Verify the document was created
    const createdDoc = await admin.firestore().collection('user').doc(TARGET_USER_ID).get();
    if (createdDoc.exists) {
      console.log('✅ User document verified:', createdDoc.data());
    } else {
      console.log('❌ User document creation failed');
    }
    
  } catch (error) {
    console.error('❌ Error fixing user document:', error);
  } finally {
    process.exit(0);
  }
}

fixMissingUserDocument();

