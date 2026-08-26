# Security Guidelines for localStorage Authentication System

## Overview
This document outlines the security considerations and best practices for the localStorage-based authentication system implemented in the Decoopa application.

## JWT Token Security

### Token Configuration
- **Access Token Expiry**: 1 hour (3600 seconds)
- **Refresh Token Expiry**: 7 days (604800 seconds)
- **Algorithm**: HS256 (HMAC SHA-256)

### Environment Variables Required
```bash
# JWT Secrets (CHANGE THESE IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Optional: Custom token expiry
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=604800
```

### Security Best Practices

#### 1. JWT Secret Management
- Use strong, randomly generated secrets (minimum 32 characters)
- Store secrets in environment variables, never in code
- Use different secrets for access and refresh tokens
- Rotate secrets regularly in production

#### 2. Token Storage
- Tokens are stored in localStorage (client-side)
- Implement automatic token refresh before expiration
- Clear tokens on logout and session expiry
- Consider implementing token blacklisting for logout

#### 3. Token Validation
- Verify token signature on every request
- Check token expiration
- Validate user exists and is not disabled
- Implement rate limiting for auth endpoints

#### 4. Error Handling
- Don't expose sensitive information in error messages
- Use consistent error codes and messages
- Log security events for monitoring
- Implement proper HTTP status codes

## API Security

### Authentication Endpoints
- `/api/auth/login` - User login
- `/api/auth/refresh` - Token refresh
- `/api/auth/logout` - User logout
- `/api/auth/verify` - Token verification

### Request/Response Format
```json
// Success Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "displayName": "User Name",
      "accountType": "customer",
      "authenticationUid": "firebase-uid"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresIn": 3600
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "auth/invalid-credentials",
    "message": "Invalid email or password"
  }
}
```

### Error Codes
- `auth/invalid-credentials` - Invalid email/password
- `auth/user-not-found` - User doesn't exist
- `auth/user-disabled` - User account is disabled
- `auth/invalid-token` - Invalid JWT token
- `auth/token-expired` - JWT token has expired
- `auth/refresh-token-required` - Refresh token missing
- `auth/invalid-refresh-token` - Invalid refresh token
- `auth/internal-error` - Server error

## Frontend Security

### Token Management
- Store tokens securely in localStorage
- Implement automatic token refresh
- Clear tokens on logout
- Handle token expiration gracefully

### Request Headers
```javascript
// Include token in API requests
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Error Handling
- Handle 401/403 responses by redirecting to login
- Implement retry logic for failed requests
- Show user-friendly error messages
- Log security events

## Production Security Checklist

### Before Deployment
- [ ] Change default JWT secrets
- [ ] Set up environment variables
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Configure security headers

### Ongoing Security
- [ ] Regular security audits
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Rotate secrets periodically
- [ ] Review access logs
- [ ] Test authentication flows

## Security Considerations

### localStorage vs sessionStorage
- localStorage persists across browser sessions
- sessionStorage clears when browser tab closes
- Consider user experience vs security requirements

### Token Refresh Strategy
- Refresh tokens 5 minutes before expiration
- Implement exponential backoff for failed refreshes
- Handle concurrent refresh requests

### Logout Security
- Clear all stored tokens
- Consider server-side token blacklisting
- Implement proper session cleanup

## Monitoring and Logging

### Security Events to Log
- Failed login attempts
- Token refresh failures
- Invalid token usage
- User account changes
- Suspicious activity patterns

### Log Format
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "event": "auth.login.failed",
  "userId": "user-id",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "errorCode": "auth/invalid-credentials"
}
```

## Compliance and Standards

### GDPR Considerations
- Implement proper data retention policies
- Provide user data export/deletion
- Document data processing activities
- Obtain proper consent for data collection

### OWASP Guidelines
- Follow OWASP Top 10 security guidelines
- Implement proper input validation
- Use secure communication protocols
- Regular security testing

## Emergency Procedures

### Security Incident Response
1. Identify and contain the incident
2. Assess the impact and scope
3. Implement immediate security measures
4. Notify relevant stakeholders
5. Document the incident and response
6. Review and improve security measures

### Token Revocation
- Implement emergency token revocation
- Have procedures for mass token invalidation
- Maintain backup authentication methods
- Document recovery procedures 