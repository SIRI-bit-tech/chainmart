"""
Secure OAuth token verification for social login endpoints.

This module provides cryptographic verification of ID tokens from major OAuth providers
to prevent authentication bypass and impersonation attacks.
"""

import jwt
import requests
import logging
from typing import Dict, Optional, Any
from datetime import datetime, timezone
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

# OAuth provider configurations
OAUTH_PROVIDERS = {
    'google': {
        'issuer': 'https://accounts.google.com',
        'jwks_uri': 'https://www.googleapis.com/oauth2/v3/certs',
        'userinfo_endpoint': 'https://www.googleapis.com/oauth2/v2/userinfo',
    },
    'microsoft': {
        'issuer': 'https://login.microsoftonline.com/common/v2.0',
        'jwks_uri': 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
        'userinfo_endpoint': 'https://graph.microsoft.com/v1.0/me',
    },
    'apple': {
        'issuer': 'https://appleid.apple.com',
        'jwks_uri': 'https://appleid.apple.com/auth/keys',
        'userinfo_endpoint': None,  # Apple doesn't provide userinfo endpoint
    }
}


class OAuthVerificationError(Exception):
    """Raised when OAuth token verification fails."""
    pass


def get_jwks_keys(provider: str) -> Dict[str, Any]:
    """
    Fetch and cache JWKS keys for the given provider.
    
    Args:
        provider: OAuth provider name (google, microsoft, apple)
        
    Returns:
        Dict containing JWKS keys
        
    Raises:
        OAuthVerificationError: If keys cannot be fetched
    """
    if provider not in OAUTH_PROVIDERS:
        raise OAuthVerificationError(f"Unsupported provider: {provider}")
    
    cache_key = f"oauth_jwks_{provider}"
    cached_keys = cache.get(cache_key)
    
    if cached_keys:
        return cached_keys
    
    try:
        jwks_uri = OAUTH_PROVIDERS[provider]['jwks_uri']
        response = requests.get(jwks_uri, timeout=10)
        response.raise_for_status()
        
        keys = response.json()
        
        # Cache for 1 hour (keys don't change frequently)
        cache.set(cache_key, keys, 3600)
        
        return keys
        
    except requests.RequestException as e:
        logger.error(f"Failed to fetch JWKS keys for {provider}: {str(e)}")
        raise OAuthVerificationError(f"Cannot fetch verification keys for {provider}")


def verify_id_token(provider: str, id_token: str, client_id: str) -> Dict[str, Any]:
    """
    Verify an OAuth ID token cryptographically.
    
    Args:
        provider: OAuth provider name
        id_token: JWT ID token from the provider
        client_id: Expected audience (client ID)
        
    Returns:
        Dict containing verified token claims
        
    Raises:
        OAuthVerificationError: If token verification fails
    """
    if provider not in OAUTH_PROVIDERS:
        raise OAuthVerificationError(f"Unsupported provider: {provider}")
    
    try:
        # Get JWKS keys for signature verification
        jwks_keys = get_jwks_keys(provider)
        
        # Decode token header to get key ID
        unverified_header = jwt.get_unverified_header(id_token)
        kid = unverified_header.get('kid')
        
        if not kid:
            raise OAuthVerificationError("Token missing key ID")
        
        # Find the matching key
        signing_key = None
        for key in jwks_keys.get('keys', []):
            if key.get('kid') == kid:
                signing_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
        
        if not signing_key:
            raise OAuthVerificationError("Cannot find matching signing key")
        
        # Verify and decode the token
        expected_issuer = OAUTH_PROVIDERS[provider]['issuer']
        
        # For Microsoft, handle tenant-specific issuer
        if provider == 'microsoft':
            expected_issuer = [
                'https://login.microsoftonline.com/common/v2.0',
                'https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0'  # Common tenant
            ]
        
        decoded_token = jwt.decode(
            id_token,
            signing_key,
            algorithms=['RS256'],
            audience=client_id,
            issuer=expected_issuer,
            options={
                'verify_exp': True,
                'verify_aud': True,
                'verify_iss': True,
                'verify_signature': True,
            }
        )
        
        # Additional validation
        now = datetime.now(timezone.utc).timestamp()
        
        # Check expiration
        if decoded_token.get('exp', 0) < now:
            raise OAuthVerificationError("Token has expired")
        
        # Check issued at time (not too far in the future)
        iat = decoded_token.get('iat', 0)
        if iat > now + 300:  # Allow 5 minutes clock skew
            raise OAuthVerificationError("Token issued in the future")
        
        # Validate email is present and verified
        email = decoded_token.get('email')
        if not email:
            raise OAuthVerificationError("Token missing email claim")
        
        # For Google and Microsoft, check email verification
        if provider in ['google', 'microsoft']:
            email_verified = decoded_token.get('email_verified', False)
            if not email_verified:
                raise OAuthVerificationError("Email not verified by provider")
        
        logger.info(f"Successfully verified {provider} ID token for {email}")
        return decoded_token
        
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid {provider} ID token: {str(e)}")
        raise OAuthVerificationError(f"Invalid token: {str(e)}")
    except Exception as e:
        logger.error(f"Token verification error for {provider}: {str(e)}")
        raise OAuthVerificationError(f"Token verification failed: {str(e)}")


def verify_access_token(provider: str, access_token: str) -> Dict[str, Any]:
    """
    Verify an access token by calling the provider's userinfo endpoint.
    
    Args:
        provider: OAuth provider name
        access_token: Access token from the provider
        
    Returns:
        Dict containing user information from provider
        
    Raises:
        OAuthVerificationError: If token verification fails
    """
    if provider not in OAUTH_PROVIDERS:
        raise OAuthVerificationError(f"Unsupported provider: {provider}")
    
    userinfo_endpoint = OAUTH_PROVIDERS[provider]['userinfo_endpoint']
    if not userinfo_endpoint:
        raise OAuthVerificationError(f"Provider {provider} does not support userinfo endpoint")
    
    try:
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(userinfo_endpoint, headers=headers, timeout=10)
        
        if response.status_code == 401:
            raise OAuthVerificationError("Invalid or expired access token")
        
        response.raise_for_status()
        user_info = response.json()
        
        # Validate required fields
        email = user_info.get('email')
        if not email:
            raise OAuthVerificationError("Userinfo missing email")
        
        logger.info(f"Successfully verified {provider} access token for {email}")
        return user_info
        
    except requests.RequestException as e:
        logger.error(f"Failed to verify access token for {provider}: {str(e)}")
        raise OAuthVerificationError(f"Access token verification failed: {str(e)}")


def get_oauth_client_id(provider: str) -> str:
    """
    Get the OAuth client ID for the given provider from settings.
    
    Args:
        provider: OAuth provider name
        
    Returns:
        Client ID string
        
    Raises:
        OAuthVerificationError: If client ID not configured
    """
    setting_name = f'OAUTH_{provider.upper()}_CLIENT_ID'
    client_id = getattr(settings, setting_name, None)
    
    if not client_id:
        raise OAuthVerificationError(f"OAuth client ID not configured for {provider}")
    
    return client_id