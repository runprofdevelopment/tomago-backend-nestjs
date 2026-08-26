const crypto = require('crypto')

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
    const iv = Buffer.from(encryptedData.slice(0, 32), 'hex'); // Extract IV from the first 32 characters
    const encryptedText = encryptedData.slice(32); // Get the encrypted text (excluding IV)
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');
      
    return isNaN(decryptedData) ? 0 : decryptedData;
  }
}
