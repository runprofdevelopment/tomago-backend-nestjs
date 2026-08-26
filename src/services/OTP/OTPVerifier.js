const admin = require('firebase-admin');
const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const OTPCode = new (require('../../database/models/OTP-code'));

module.exports = class OTPSender {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(OTPCode.collectionName);
  }

  async verifyOTP(OTP) {
    const userId = this.currentUser?.id;
    console.log('OTPVerifier.verifyOTP: Starting verification for user:', userId);

    const otpEntry = await this.repository.findDocumentById(userId);
    console.log('OTPVerifier.verifyOTP: OTP entry found:', otpEntry ? 'yes' : 'no');

    if (!otpEntry) {
      throw new Error(`No OTP found for user ${userId}`);
    }

    const { otpCode, expirationTime, documentRef, phoneNumber } = otpEntry;
    if (Date.now() > expirationTime) {
      // this.validOTPs.delete(userId); // OTP expired
      throw new Error('OTP expired');
    }

    if (OTP !== otpCode) {
      throw new Error('Invalid OTP'); // OTP does not match
    }
    
    if (OTP === otpCode) {
      // this.validOTPs.delete(userId); // OTP verified, remove it
    
      const batch = await FirebaseHelper.createBatch();
      
      console.log('OTP Verification - documentRef type:', typeof documentRef);
      console.log('OTP Verification - documentRef:', documentRef);
      console.log('OTP Verification - phoneNumber:', phoneNumber);
      
      let documentRefObj;
      
      // Handle different types of documentRef
      if (typeof documentRef === 'string') {
        // If it's a string, convert it to DocumentReference
        documentRefObj = admin.firestore().doc(documentRef);
      } else if (documentRef && typeof documentRef === 'object' && documentRef.path) {
        // If it's already a DocumentReference object
        documentRefObj = documentRef;
      } else {
        throw new Error(`Invalid documentRef type: ${typeof documentRef}, value: ${JSON.stringify(documentRef)}`);
      }
      
      // Update the specific document (user or address)
      console.log('OTPVerifier.verifyOTP: Updating document with phoneNumber:', phoneNumber);
      batch.update(documentRefObj, { phoneNumber, phoneVerified: true });
      
      // Also update user's phoneVerified if this was for an address
      const documentPath = typeof documentRef === 'string' ? documentRef : documentRef.path;
      if (documentPath && documentPath.includes('/addresses/')) {
        if (!userId || userId.trim() === '') {
          throw new Error(`Invalid userId: ${userId}`);
        }
        const userRef = admin.firestore().doc(`user/${userId}`);
        batch.update(userRef, { phoneVerified: true });
      }
      
      // Also update all addresses with the same phone number
      const addressesSnapshot = await admin.firestore().collection(`user/${userId}/addresses`).get();
      if (addressesSnapshot && addressesSnapshot.docs) {
        addressesSnapshot.docs.forEach(doc => {
          const addressData = doc.data();
          if (addressData.phoneNumber === phoneNumber) {
            batch.update(doc.ref, { phoneVerified: true });
          }
        });
      }
      
      await FirebaseHelper.commitBatch(batch);
      console.log('OTPVerifier.verifyOTP: Database update completed successfully');
    }
  }

  // async confirmVerification() {}
};