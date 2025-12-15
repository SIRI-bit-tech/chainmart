import logging
import secrets
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from eth_account.messages import encode_defunct
from web3 import Web3

from .models import KYCVerification, UserNotificationPreference, UserProfile
from .serializers import (
    KYCVerificationSerializer,
    UserNotificationPreferenceSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
)

logger = logging.getLogger(__name__)

# Constants
NONCE_EXPIRY_SECONDS = 300  # 5 minutes
NONCE_CACHE_PREFIX = 'wallet_nonce:'
ALLOWED_SOCIAL_PROVIDERS = {'google', 'microsoft', 'apple', 'azure-ad'}


def verify_wallet_signature(message: str, signature: str, wallet_address: str) -> bool:
    """
    Shared helper to verify wallet signature.
    
    Args:
        message: The message that was signed
        signature: The signature to verify
        wallet_address: The expected wallet address
        
    Returns:
        bool: True if signature is valid, False otherwise
        
    Raises:
        ValueError, TypeError: If signature format is invalid
    """
    w3 = Web3()
    recovered_address = w3.eth.account.recover_message(
        encode_defunct(text=message),
        signature=signature
    )
    return recovered_address.lower() == wallet_address.lower()


def generate_nonce(wallet_address: str) -> str:
    """
    Generate a one-time nonce for wallet verification.
    
    Args:
        wallet_address: The wallet address requesting a nonce
        
    Returns:
        str: A unique nonce string
    """
    nonce = secrets.token_urlsafe(32)
    cache_key = f"{NONCE_CACHE_PREFIX}{wallet_address.lower()}"
    cache.set(cache_key, nonce, NONCE_EXPIRY_SECONDS)
    return nonce


def validate_and_consume_nonce(wallet_address: str, nonce: str) -> bool:
    """
    Validate a nonce and consume it (one-time use).
    
    Args:
        wallet_address: The wallet address
        nonce: The nonce to validate
        
    Returns:
        bool: True if nonce is valid and not expired, False otherwise
    """
    cache_key = f"{NONCE_CACHE_PREFIX}{wallet_address.lower()}"
    stored_nonce = cache.get(cache_key)
    
    if not stored_nonce or stored_nonce != nonce:
        return False
    
    # Consume the nonce (delete it so it can't be reused)
    cache.delete(cache_key)
    return True


class UserViewSet(viewsets.ModelViewSet):
    """User profile management"""
    queryset = UserProfile.objects.select_related('kyc_record').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'partial_update' or self.action == 'update':
            return UserProfileUpdateSerializer
        return UserProfileSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def complete_profile(self, request):
        """Finalize profile details and mark onboarding completed"""
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        request.user.profile_completed = True
        request.user.save(update_fields=['profile_completed'])
        return Response(UserProfileSerializer(request.user).data)
    
    @action(detail=False, methods=['post'])
    def verify_wallet(self, request):
        """Verify wallet ownership via signature (authenticated users)"""
        signature = request.data.get('signature')
        message = request.data.get('message')
        wallet_address = request.data.get('wallet_address')
        nonce = request.data.get('nonce')
        
        if not all([signature, message, wallet_address, nonce]):
            return Response(
                {'error': 'Missing required fields'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate nonce
        if not validate_and_consume_nonce(wallet_address, nonce):
            return Response(
                {'error': 'Invalid or expired nonce'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify signature using shared helper
        try:
            if not verify_wallet_signature(message, signature, wallet_address):
                return Response(
                    {'error': 'Signature verification failed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError) as e:
            return Response(
                {'error': 'Invalid signature format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Wallet verification error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Verification failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Update user
        try:
            request.user.wallet_address = wallet_address.lower()
            request.user.wallet_verified = True
            request.user.save()
            return Response(UserProfileSerializer(request.user).data)
        except IntegrityError:
            return Response(
                {'error': 'Wallet address already in use'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get', 'post'])
    def kyc(self, request):
        """Submit or fetch KYC state for the authenticated user
        
        POST submissions are set to 'pending' status and require external
        provider/webhook/admin confirmation to move to 'verified' status.
        """
        record, _ = KYCVerification.objects.get_or_create(user=request.user)

        if request.method.lower() == 'get':
            return Response(KYCVerificationSerializer(record).data)

        serializer = KYCVerificationSerializer(record, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Save details and mark as pending for external/provider/admin confirmation
        serializer.save()
        record.status = 'pending'
        record.rejection_reason = ''  # Clear any previous rejection reason
        record.save(update_fields=['status', 'rejection_reason'])

        # Mark user profile complete only if KYC is already verified
        if record.status == 'verified' and request.user.wallet_verified and not request.user.profile_completed:
            request.user.profile_completed = True
            request.user.save(update_fields=['profile_completed'])

        return Response(KYCVerificationSerializer(record).data)
    
    @action(detail=False, methods=['get', 'put'])
    def notifications(self, request):
        """Get/update notification preferences"""
        prefs, _ = UserNotificationPreference.objects.get_or_create(user=request.user)
        
        if request.method == 'PUT':
            serializer = UserNotificationPreferenceSerializer(prefs, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        
        serializer = UserNotificationPreferenceSerializer(prefs)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_nonce(request):
    """
    Request a one-time nonce for wallet verification.
    
    This must be called before verify_wallet_public to get a challenge.
    """
    wallet_address = request.data.get('wallet_address')
    
    if not wallet_address:
        return Response(
            {'error': 'wallet_address is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate wallet address format
    if not Web3.is_address(wallet_address):
        return Response(
            {'error': 'Invalid wallet address format'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    nonce = generate_nonce(wallet_address)
    
    return Response({
        'nonce': nonce,
        'message': f'Sign this message to verify your wallet ownership on ChainMart.\nNonce: {nonce}\nTimestamp: {timezone.now().isoformat()}',
        'expires_in': NONCE_EXPIRY_SECONDS,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_wallet_public(request):
    """
    Public endpoint to verify wallet and create/login user.
    
    Requires a valid nonce obtained from request_nonce endpoint.
    """
    signature = request.data.get('signature')
    message = request.data.get('message')
    wallet_address = request.data.get('wallet_address')
    nonce = request.data.get('nonce')
    
    # Validate required fields
    if not all([signature, message, wallet_address, nonce]):
        return Response(
            {'error': 'Missing required fields'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate wallet address format
    if not Web3.is_address(wallet_address):
        return Response(
            {'error': 'Invalid wallet address format'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate and consume nonce (prevents replay attacks)
    if not validate_and_consume_nonce(wallet_address, nonce):
        logger.warning(f"Invalid nonce attempt for wallet: {wallet_address}")
        return Response(
            {'error': 'Invalid or expired nonce'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify signature using shared helper
    try:
        if not verify_wallet_signature(message, signature, wallet_address):
            logger.warning(f"Signature verification failed for wallet: {wallet_address}")
            return Response(
                {'error': 'Signature verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except (ValueError, TypeError) as e:
        logger.warning(f"Invalid signature format for wallet {wallet_address}: {str(e)}")
        return Response(
            {'error': 'Invalid signature format'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Unexpected error during signature verification: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Verification failed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Get or create user with this wallet
    try:
        user, created = UserProfile.objects.get_or_create(
            wallet_address=wallet_address.lower(),
            defaults={
                'username': f'user_{wallet_address[:8].lower()}',
                'wallet_verified': True,
            }
        )
        
        # Update verification status if user already exists
        if not created and not user.wallet_verified:
            user.wallet_verified = True
            user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        logger.info(f"Wallet verification successful for: {wallet_address} (created={created})")
        
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data,
            'created': created,
        }, status=status.HTTP_200_OK)
        
    except IntegrityError as e:
        logger.error(f"Database integrity error for wallet {wallet_address}: {str(e)}")
        return Response(
            {'error': 'User creation failed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        logger.error(f"Unexpected error during user creation: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Authentication failed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _issue_tokens_for_user(user: UserProfile) -> Response:
    refresh = RefreshToken.for_user(user)
    return Response({
        'token': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserProfileSerializer(user).data,
    })


def _build_username_from_email(email: str) -> str:
    base = email.split('@')[0]
    candidate = base
    while UserProfile.objects.filter(username=candidate).exists():
        suffix = secrets.token_hex(2)
        candidate = f"{base}_{suffix}"
    return candidate


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Email/password registration"""
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    display_name = request.data.get('display_name') or username

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if UserProfile.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    if not username:
        username = _build_username_from_email(email)
    if not display_name:
        display_name = username

    with transaction.atomic():
        user = UserProfile.objects.create_user(
            username=username,
            email=email,
            display_name=display_name,
        )
        user.set_password(password)
        user.save()

    return _issue_tokens_for_user(user)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Email/password login"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = UserProfile.objects.filter(email=email).first()
    if not user or not user.check_password(password):
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    return _issue_tokens_for_user(user)


@api_view(['POST'])
@permission_classes([AllowAny])
def social_login(request):
    """
    Secure OAuth login with cryptographic token verification.
    
    Supports Google, Microsoft, and Apple OAuth providers with proper ID token
    verification to prevent authentication bypass and impersonation attacks.
    
    Required fields:
    - provider: 'google', 'microsoft', or 'apple'
    - id_token: JWT ID token from the OAuth provider
    
    Optional fields:
    - access_token: For additional verification via userinfo endpoint
    - display_name: User's display name
    - avatar: User's avatar URL
    """
    from .oauth_verifier import verify_id_token, verify_access_token, get_oauth_client_id, OAuthVerificationError
    
    provider = request.data.get('provider')
    id_token = request.data.get('id_token')
    access_token = request.data.get('access_token')
    display_name = request.data.get('display_name') or request.data.get('name')
    avatar = request.data.get('avatar')
    
    # Validate required fields
    if not provider:
        return Response({'error': 'Provider is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if provider not in ALLOWED_SOCIAL_PROVIDERS:
        return Response({'error': 'Unsupported provider'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not id_token:
        return Response({'error': 'ID token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get OAuth client ID for this provider
        client_id = get_oauth_client_id(provider)
        
        # Verify ID token cryptographically
        token_claims = verify_id_token(provider, id_token, client_id)
        
        # Extract verified user information
        email = token_claims['email']
        verified_display_name = token_claims.get('name') or display_name
        verified_avatar = token_claims.get('picture') or avatar
        
        # Optional: Additional verification via access token
        if access_token:
            try:
                userinfo = verify_access_token(provider, access_token)
                # Cross-verify email matches
                if userinfo.get('email') != email:
                    logger.warning(f"Email mismatch between ID token and userinfo for {provider}")
                    return Response({'error': 'Token verification failed'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Use userinfo data if available
                verified_display_name = userinfo.get('name') or verified_display_name
                verified_avatar = userinfo.get('picture') or verified_avatar
                
            except OAuthVerificationError as e:
                logger.warning(f"Access token verification failed for {provider}: {str(e)}")
                # Continue with ID token verification only
        
        # Create or get user with verified email
        username = _build_username_from_email(email)
        defaults = {
            'username': username,
            'display_name': verified_display_name or username,
            'avatar': verified_avatar,
            'email_verified': True,  # OAuth providers verify emails
        }
        
        user, created = UserProfile.objects.get_or_create(email=email, defaults=defaults)
        
        # Update user metadata if changed
        updates = {}
        if verified_display_name and user.display_name != verified_display_name:
            updates['display_name'] = verified_display_name
        if verified_avatar and user.avatar != verified_avatar:
            updates['avatar'] = verified_avatar
        if not user.email_verified:
            updates['email_verified'] = True
        
        if updates:
            for key, value in updates.items():
                setattr(user, key, value)
            user.save(update_fields=list(updates.keys()))
        
        logger.info(f"Secure OAuth login success via {provider} for {email} (created={created})")
        
        return _issue_tokens_for_user(user)
        
    except OAuthVerificationError as e:
        logger.warning(f"OAuth verification failed for {provider}: {str(e)}")
        return Response(
            {'error': 'Authentication failed', 'details': 'Invalid or expired token'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f"Unexpected error during OAuth login for {provider}: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Authentication failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
