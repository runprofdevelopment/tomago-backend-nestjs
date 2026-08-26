const FirestoreRepository = require('../../database/repositories/firestoreRepository');

class RateLimiter {
  constructor() {
    this.memoryStore = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000); // Clean up every hour
  }

  /**
   * Check if a user has exceeded the rate limit for email verification
   * @param {string} userId - The user ID
   * @param {number} maxRequests - Maximum requests allowed (default: 3)
   * @param {number} windowMs - Time window in milliseconds (default: 1 hour)
   * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
   */
  async checkEmailVerificationLimit(userId, maxRequests = 3, windowMs = 60 * 60 * 1000) {
    const now = Date.now();
    const key = `email_verification:${userId}`;
    
    // Check memory store first
    if (this.memoryStore.has(key)) {
      const record = this.memoryStore.get(key);
      
      // If window has expired, reset
      if (now - record.firstRequest >= windowMs) {
        this.memoryStore.set(key, { firstRequest: now, count: 1 });
        return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
      }
      
      // Check if limit exceeded
      if (record.count >= maxRequests) {
        return { 
          allowed: false, 
          remaining: 0, 
          resetTime: record.firstRequest + windowMs 
        };
      }
      
      // Increment count
      record.count++;
      this.memoryStore.set(key, record);
      return { 
        allowed: true, 
        remaining: maxRequests - record.count, 
        resetTime: record.firstRequest + windowMs 
      };
    }
    
    // First request for this user
    this.memoryStore.set(key, { firstRequest: now, count: 1 });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  /**
   * Clean up expired entries from memory store
   */
  cleanup() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, record] of this.memoryStore.entries()) {
      if (now - record.firstRequest >= oneHour) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for a user (useful for testing or manual override)
   * @param {string} userId - The user ID
   */
  resetLimit(userId) {
    const key = `email_verification:${userId}`;
    this.memoryStore.delete(key);
  }

  /**
   * Get current rate limit status for a user
   * @param {string} userId - The user ID
   * @returns {Object|null} - Rate limit status or null if no record exists
   */
  getStatus(userId) {
    const key = `email_verification:${userId}`;
    const record = this.memoryStore.get(key);
    
    if (!record) {
      return null;
    }
    
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (now - record.firstRequest >= oneHour) {
      return null; // Expired
    }
    
    return {
      count: record.count,
      remaining: Math.max(0, 3 - record.count),
      resetTime: record.firstRequest + oneHour,
      timeUntilReset: Math.max(0, record.firstRequest + oneHour - now)
    };
  }
}

// Export singleton instance
module.exports = new RateLimiter(); 