# OAuth Security Implementation

## Overview

This document describes the secure OAuth implementation for the ChainMart social login endpoint. The implementation provides cryptographic verification of OAuth tokens to prevent authentication bypass and impersonation attacks.

## Security Features

### 🔒 **Cryptographic Token Verification**
- **JWT Signature Verification**: Uses RSA-256 signatures with provider's public keys
- **JWKS Key Fetching**: Automatically fetches and caches provider public keys
- **Audience Validation**: Verifies tokens are intended for our application
- **Issuer Validation**: Ensures tokens come from legitimate OAuth providers
- **Expiration Validation**: Rejects expired tokens with clock skew tolerance

### 🛡️ **Attack Prevention**
- **Impersonation Protection**: Cannot login with arbitrary email addresses
- **Token Replay Protection**: Validates token freshness and expiration
- **Cross-Provider Protection**: Validates tokens against correct provider
- **Email Verification**: Requires provider-verified email addresses

### ⚡ **Performance & Reliability**
- **JWKS Caching**: Caches provider keys for 1 hour to reduce latency
- **Graceful Degradation**: Continues with ID token if access token fails
- **Comprehensive Logging**: Detailed security event logging
- **Error Handling**: Secure error messages that don't leak information

## Supported Providers

### Google OAuth 2.0
- **Issuer**: `https://accounts.google.com`
- **JWKS**: `https://www.googleapis.com/oauth2/v3/certs`
- **Userinfo**: `https://www.googleapis.com/oauth2/v2/userinfo`
- **Required Claims**: `email`, `email_verified`, `aud`, `iss`, `exp`

### Microsoft Azure AD
- **Issuer**: `https://login.microsoftonline.com/common/v2.0`
- **JWKS**: `https://login.microsoftonline.com/common/discovery/v2.0/keys`
- **Userinfo**: `https://graph.microsoft.com/v1.0/me`
- **Required Claims**: `email`, `email_verified`, `aud`, `iss`, `exp`

### Apple Sign In
- **Issuer**: `https://appleid.apple.com`
- **JWKS**: `https://appleid.apple.com/auth/keys`
- **Userinfo**: Not supported (uses ID token only)
- **Required Claims**: `email`, `aud`, `iss`, `exp`

## API Usage

### Endpoint
```
POST /api/users/social-login/
```

### Required Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "provider": "google|microsoft|apple",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "access_token": "optional_access_token",
  "display_name": "Optional Display Name",
  "avatar": "https://optional-avatar-url.com/image.jpg"
}
```

### Success Response (200)
```json
{
  "token": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "display_name": "User Name",
    "avatar": "https://avatar-url.com/image.jpg",
    "email_verified": true,
    "wallet_verified": false,
    "profile_completed": false
  },
  "created": false
}
```

### Error Responses

#### 400 Bad Request - Missing Required Fields
```json
{
  "error": "Provider is required"
}
```

#### 400 Bad Request - Unsupported Provider
```json
{
  "error": "Unsupported provider"
}
```

#### 401 Unauthorized - Invalid Token
```json
{
  "error": "Authentication failed",
  "details": "Invalid or expired token"
}
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here

# Microsoft OAuth  
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here

# Apple OAuth
APPLE_CLIENT_ID=your_apple_client_id_here
```

### Provider Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy the Client ID to `GOOGLE_CLIENT_ID`

#### Microsoft OAuth Setup
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Create a new registration
4. Configure redirect URIs
5. Copy the Application (client) ID to `MICROSOFT_CLIENT_ID`

#### Apple OAuth Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a new App ID
3. Enable Sign In with Apple
4. Create a Service ID
5. Copy the Service ID to `APPLE_CLIENT_ID`

## Security Considerations

### Token Validation Flow
1. **Extract Key ID**: Get `kid` from JWT header
2. **Fetch JWKS**: Retrieve provider's public keys (cached)
3. **Verify Signature**: Cryptographically verify JWT signature
4. **Validate Claims**: Check audience, issuer, expiration
5. **Extract User Data**: Get verified email and profile info
6. **Cross-Verify**: Optional access token validation
7. **Create/Update User**: Safe user creation with verified data

### Security Best Practices
- **Never trust client data**: All user info comes from verified tokens
- **Validate all claims**: Audience, issuer, expiration are mandatory
- **Use HTTPS only**: OAuth tokens must be transmitted securely
- **Log security events**: Monitor for suspicious authentication attempts
- **Rate limit**: Implement rate limiting on the endpoint
- **Monitor tokens**: Watch for unusual token patterns or sources

### Common Attack Vectors (Prevented)
- ❌ **Email Impersonation**: Cannot fake email addresses
- ❌ **Token Replay**: Expired tokens are rejected
- ❌ **Cross-Provider**: Cannot use Google token for Microsoft login
- ❌ **Signature Forgery**: Cryptographic verification prevents tampering
- ❌ **Audience Confusion**: Tokens must be intended for our app

## Monitoring & Logging

### Security Events Logged
- Successful OAuth logins with provider and email
- Failed token verification attempts
- Invalid provider requests
- JWKS key fetch failures
- Token expiration violations

### Log Levels
- **INFO**: Successful authentications
- **WARNING**: Invalid tokens, verification failures
- **ERROR**: System errors, JWKS fetch failures

### Example Log Entries
```
INFO: Secure OAuth login success via google for user@example.com (created=False)
WARNING: OAuth verification failed for google: Invalid token: Token has expired
ERROR: Failed to fetch JWKS keys for microsoft: Connection timeout
```

## Testing

### Manual Testing
Use tools like Postman or curl to test the endpoint:

```bash
curl -X POST http://localhost:8000/api/users/social-login/ \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "id_token": "your_real_google_id_token_here"
  }'
```

### Integration Testing
The implementation includes comprehensive error handling for:
- Invalid JWT formats
- Expired tokens
- Wrong audience/issuer
- Missing required claims
- Network failures during key fetching

## Migration from Insecure Implementation

### Before (Vulnerable)
```python
# OLD - INSECURE: Trusted client-provided data
user, created = UserProfile.objects.get_or_create(
    email=request.data.get('email'),  # ❌ Trusted client data
    defaults={'email_verified': True}  # ❌ No verification
)
```

### After (Secure)
```python
# NEW - SECURE: Cryptographically verified data
token_claims = verify_id_token(provider, id_token, client_id)
email = token_claims['email']  # ✅ Cryptographically verified
user, created = UserProfile.objects.get_or_create(
    email=email,  # ✅ Verified by OAuth provider
    defaults={'email_verified': True}  # ✅ Provider verified
)
```

## Troubleshooting

### Common Issues

#### "Cannot fetch verification keys"
- Check internet connectivity
- Verify provider JWKS URLs are accessible
- Check for firewall blocking outbound requests

#### "Invalid token: Token has expired"
- Ensure client gets fresh tokens from provider
- Check system clock synchronization
- Verify token lifetime expectations

#### "OAuth client ID not configured"
- Add required environment variables to `.env`
- Restart Django server after configuration changes
- Verify environment variable names match settings

#### "Unsupported provider"
- Check provider name spelling (case-sensitive)
- Ensure provider is in `ALLOWED_SOCIAL_PROVIDERS`
- Verify provider configuration in `OAUTH_PROVIDERS`

### Debug Mode
Enable debug logging to troubleshoot issues:

```python
LOGGING = {
    'loggers': {
        'apps.users.oauth_verifier': {
            'level': 'DEBUG',
            'handlers': ['console'],
        }
    }
}
```

## Conclusion

This OAuth implementation provides enterprise-grade security for social authentication while maintaining ease of use. The cryptographic verification ensures that only legitimate users with valid OAuth tokens can authenticate, preventing the critical security vulnerabilities present in the previous implementation.

The system is now production-ready and follows OAuth 2.0 and OpenID Connect security best practices.