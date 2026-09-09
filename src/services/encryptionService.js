const crypto = require('crypto')

function asPlainAmount(value) {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Ciphertext is iv (16 bytes / 32 hex chars) + AES block(s).
function isEncryptedPayload(value) {
  return (
    typeof value === 'string' &&
    value.length >= 64 &&
    value.length % 2 === 0 &&
    /^[0-9a-f]+$/i.test(value)
  );
}

module.exports = {
  async encryptData(data, key) {
    data = data.toString()
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encryptedData = cipher.update(data, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return iv.toString('hex') + encryptedData;
  },

  async decryptData(encryptedData, key) {
    if (!key || !isEncryptedPayload(encryptedData)) {
      return asPlainAmount(encryptedData);
    }

    const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
    if (iv.length !== 16) {
      return asPlainAmount(encryptedData);
    }

    const encryptedText = encryptedData.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');

    return isNaN(decryptedData) ? 0 : decryptedData;
  }
}
