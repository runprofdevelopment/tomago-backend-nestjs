const crypto = require('crypto');
const admin = require('../../infrastructure/firebaseInit');
const ErrorHandler = require('../../errors/errorHandler');
const UserRepository = require('../../database/repositories/userRepository');
const AuthFirebaseService = require('../../infrastructure/auth/authFirebaseService');
const FirebaseHelper = require('../../database/utils/firebaseHelper');

const COLLECTION = 'emailVerificationTokens';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

module.exports = class EmailVerificationTokenService {
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static generateRawToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static async _resolveDatabaseUser({ userId, email, authenticationUid }) {
    if (userId) {
      const byId = await UserRepository.findById(userId);
      if (byId) {
        return byId;
      }
    }

    if (email) {
      const byEmail = await UserRepository.findByEmail(email);
      if (byEmail) {
        return byEmail;
      }
    }

    if (authenticationUid) {
      const byAuthUid = await UserRepository.findByAuthenticationUid(
        authenticationUid,
      );
      if (byAuthUid) {
        return byAuthUid;
      }
    }

    return null;
  }

  /**
   * Creates a one-time email verification token for the user.
   * @returns {Promise<string>} raw token (only returned once)
   */
  static async createToken({ userId, email, authenticationUid }) {
    const db = admin.firestore();
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

    // Invalidate previous unused tokens for this user
    const existing = await db
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    existing.docs.forEach((doc) => {
      const data = doc.data();
      if (!data.usedAt && !data.invalidated) {
        batch.update(doc.ref, {
          usedAt: now,
          invalidated: true,
        });
      }
    });

    batch.set(db.collection(COLLECTION).doc(tokenHash), {
      userId,
      email,
      authenticationUid: authenticationUid || null,
      tokenHash,
      expiresAt,
      usedAt: null,
      invalidated: false,
      createdAt: now,
    });

    await batch.commit();
    return rawToken;
  }

  /**
   * Confirms a verification token: marks DB + Firebase Auth emailVerified.
   */
  static async confirmToken(rawToken, language = 'en') {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new ErrorHandler({
        errorCode: 'INVALID_TOKEN',
        message:
          language === 'ar'
            ? 'رمز التحقق غير صالح'
            : 'Invalid verification token',
      });
    }

    const db = admin.firestore();
    const tokenHash = this.hashToken(rawToken.trim());
    const docRef = db.collection(COLLECTION).doc(tokenHash);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new ErrorHandler({
        errorCode: 'INVALID_TOKEN',
        message:
          language === 'ar'
            ? 'رمز التحقق غير صالح أو منتهي'
            : 'Invalid or expired verification token',
      });
    }

    const record = snap.data();
    const now = new Date();

    if (record.usedAt || record.invalidated) {
      throw new ErrorHandler({
        errorCode: 'TOKEN_USED',
        message:
          language === 'ar'
            ? 'تم استخدام رمز التحقق من قبل'
            : 'Verification token has already been used',
      });
    }

    const expiresAt =
      record.expiresAt && record.expiresAt.toDate
        ? record.expiresAt.toDate()
        : new Date(record.expiresAt);

    if (expiresAt.getTime() < now.getTime()) {
      throw new ErrorHandler({
        errorCode: 'TOKEN_EXPIRED',
        message:
          language === 'ar'
            ? 'انتهت صلاحية رمز التحقق'
            : 'Verification token has expired',
      });
    }

    const userId = record.userId;
    const authenticationUid = record.authenticationUid;

    const databaseUser = await this._resolveDatabaseUser({
      userId,
      email: record.email,
      authenticationUid,
    });

    if (!databaseUser) {
      throw new ErrorHandler({
        errorCode: 'USER_NOT_FOUND',
        message:
          language === 'ar'
            ? 'لم يتم العثور على حساب المستخدم'
            : 'User account not found',
      });
    }

    const resolvedUserId = databaseUser.id;
    const resolvedAuthUid =
      authenticationUid || databaseUser.authenticationUid || null;

    const batch = await FirebaseHelper.createBatch();
    await UserRepository.update(
      resolvedUserId,
      {
        emailVerified: true,
      },
      {
        currentUser: { id: resolvedUserId },
        language,
        batch,
      },
    );
    await FirebaseHelper.commitBatch(batch);

    if (resolvedAuthUid) {
      try {
        await AuthFirebaseService.updateUser(resolvedAuthUid, {
          emailVerified: true,
        });
      } catch (error) {
        console.warn(
          'EmailVerificationTokenService: Failed to update Firebase Auth emailVerified:',
          error.message,
        );
      }
    }

    await docRef.update({
      usedAt: now,
    });

    return {
      userId: resolvedUserId,
      email: record.email,
      emailVerified: true,
    };
  }

  static renderResultPage({ success, title, message, language = 'en' }) {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const bg = success ? '#ecfdf5' : '#fef2f2';
    const border = success ? '#10b981' : '#ef4444';
    const color = success ? '#065f46' : '#991b1b';

    return `<!DOCTYPE html>
<html lang="${language === 'ar' ? 'ar' : 'en'}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: #0f172a;
      color: #0f172a;
    }
    .card {
      max-width: 420px;
      width: calc(100% - 2rem);
      padding: 2rem;
      border-radius: 16px;
      background: ${bg};
      border: 2px solid ${border};
      box-shadow: 0 20px 40px rgba(0,0,0,.25);
      text-align: center;
    }
    h1 { margin: 0 0 .75rem; font-size: 1.35rem; color: ${color}; }
    p { margin: 0; line-height: 1.5; color: #334155; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
  }
};
