const FirestoreRepository = require('../../database/repositories/firestoreRepository');
const FirebaseHelper = require('../../database/utils/firebaseHelper');
const smsService = require('../../infrastructure/sms/smseg');
const OTPCode = new (require('../../database/models/OTP-code'));

module.exports = class OTPSender {
  constructor(context) {
    this.context = context;
    this.currentUser = context && context.currentUser;
    this.language = context && context.language;
    this.repository = new FirestoreRepository(OTPCode.collectionName);
  }

  async sendOTP(data) {
    try {
      data = await this._preSave(data);

      const { phoneNumber } = data;
      const TTL = 30;
      const OTP = await this.sendSMS(phoneNumber, TTL);
      const res = await this.storeOTP(data, OTP, TTL);

      return res;
    } catch (error) {
      throw error;
    }
  }

  async sendSMS(mobile, TTL = 5) {
    const OTP = this._generateOTP();

    // const message = this._generateOTPMessage(OTP, TTL);
    // const message = `
    //   Your OTP code is ${OTP}.
    //   For your security, please do not share this code with anyone.
    //   This code expires in ${TTL} minutes.
    // `;

    const message = `${OTP} is your OTP from Tomago, do not share it with anyone. It will expire in ${TTL} minutes.`;
    const response = await smsService.sendSMS(message, mobile);
    console.log('SMS_RESPONSE =', response);
    
    return OTP;
  }

  async storeOTP(data, otp, TTL = 5) {
    TTL = TTL || 5;
    const dateNow = new Date();
    const expirationTime = dateNow.getTime() + (TTL * 60 * 1000); // OTP valid for 5 minutes

    data['otpCode'] = otp;
    data['expirationTime'] = expirationTime;

    const batch = await FirebaseHelper.createBatch();
    const record = await this.repository.createDocument(data, {
      batch,
      currentUser: this.currentUser,
      language: this.language, 
    });
    await FirebaseHelper.commitBatch(batch);

    return await this.repository.findDocumentById(record.id);
  }

  /**
   * Generate a 6-digit OTP
   * @returns {String} OTP code string
   */
  _generateOTP() {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  _generateOTPMessage(otp, TTL = 5) {
    let message = '';

    if (this.language === 'ar') {
      message = `
        رمز التحقق الخاص بك هو ${otp}.
        للحفاظ على أمانك، لا تشارك هذا الكود مع أي شخص.
        تنتهي صلاحيه هذا الكود خلال ${TTL} دقيقة.
      `;
    } else {
      message = `
        Your OTP code is ${otp}.
        For your security, please do not share this code with anyone.
        This code expires in ${TTL} minutes.
      `;
    }

    return message;
  }


  async _preSave(data) {
    const currentUserId = this.currentUser?.id;
    if (!currentUserId) throw new Error('currentUserId is required');
    if (!data.targetName) throw new Error('targetName is required');
    if (!data.targetId) throw new Error('targetId is required');
    
    if (data.targetName === 'user' && data.targetId !== currentUserId) {
      data.targetId = currentUserId;
    }

    let phoneNumber = null;
    let documentRef = null;

    if (data.targetName === 'user') {
      // Fetch the latest user data from database with retry logic to handle race conditions
      let user = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!user && retryCount < maxRetries) {
        user = await FirebaseHelper.findDocument('user', data.targetId);
        if (!user) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`OTPSender: User not found, retrying... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
          }
        }
      }
      
      if (!user) throw new Error('user not found after retries');
      
      phoneNumber = user.phoneNumber;
      console.log('OTPSender: Using phone number from database:', phoneNumber);
      console.log('OTPSender: Current user context phone:', this.currentUser.phoneNumber);
      
      documentRef = `user/${currentUserId}`;
    }

    if (data.targetName === 'addresses') {
      const address = await FirebaseHelper.findDocument(`user/${currentUserId}/addresses`, data.targetId);
      if (!address) throw new Error('address not found');

      documentRef = `user/${currentUserId}/addresses/${data.targetId}`;
      phoneNumber = address.phoneNumber;
    }

    if (!phoneNumber) throw new Error(`There is no phone number associated with this targetID: ${data.targetId}`);  
    if (!documentRef) throw new Error(`documentRef is null or empty. targetName: ${data.targetName}, targetId: ${data.targetId}, currentUserId: ${currentUserId}`);

    console.log('OTPSender - Storing documentRef:', documentRef);
    console.log('OTPSender - phoneNumber:', phoneNumber);

    data = OTPCode.cast({
      id: currentUserId,
      userId: currentUserId,
      phoneNumber,
      documentRef,
    });

    return data;
  }
};