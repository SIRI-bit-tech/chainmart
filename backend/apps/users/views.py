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
    queryset = UserProfile.objects.all()
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
        """Submit or fetch KYC state for the authenticated user"""
        record, _ = KYCVerification.objects.get_or_create(user=request.user)

        if request.method.lower() == 'get':
            return Response(KYCVerificationSerializer(record).data)

        serializer = KYCVerificationSerializer(record, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Save details and mark as verified for this phase (provider hook can adjust)
        serializer.save()
        record.status = 'verified'
        record.verified_at = timezone.now()
        record.rejection_reason = ''
        record.save(update_fields=['status', 'verified_at', 'rejection_reason'])

        # Mark user profile complete if wallet and kyc are done
        if request.user.wallet_verified and not request.user.profile_completed:
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
    """Login or register via trusted OAuth providers (Google, Microsoft, Apple)."""
    provider = request.data.get('provider')
    email = request.data.get('email')
    display_name = request.data.get('display_name') or request.data.get('name')
    avatar = request.data.get('avatar')
    provider_user_id = request.data.get('provider_user_id')

    if provider not in ALLOWED_SOCIAL_PROVIDERS:
        return Response({'error': 'Unsupported provider'}, status=status.HTTP_400_BAD_REQUEST)
    if not email:
        return Response({'error': 'Email is required from provider'}, status=status.HTTP_400_BAD_REQUEST)

    username = _build_username_from_email(email)
    defaults = {
        'username': username,
        'display_name': display_name or username,
        'avatar': avatar,
        'email_verified': True,
    }

    user, created = UserProfile.objects.get_or_create(email=email, defaults=defaults)

    # Keep provider metadata fresh
    updates = {}
    if display_name and user.display_name != display_name:
        updates['display_name'] = display_name
    if avatar and user.avatar != avatar:
        updates['avatar'] = avatar
    if not user.email_verified:
        updates['email_verified'] = True

    if updates:
        for key, value in updates.items():
            setattr(user, key, value)
        user.save(update_fields=list(updates.keys()))

    logger.info(f"Social login success via {provider} for {email} (created={created}, provider_user_id={provider_user_id})")

    return _issue_tokens_for_user(user)
