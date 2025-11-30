import logging
import secrets
from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache
from django.db import IntegrityError
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from eth_account.messages import encode_defunct
from web3 import Web3
from .models import UserProfile, UserNotificationPreference
from .serializers import UserProfileSerializer, UserProfileUpdateSerializer, UserNotificationPreferenceSerializer

logger = logging.getLogger(__name__)

# Constants
NONCE_EXPIRY_SECONDS = 300  # 5 minutes
NONCE_CACHE_PREFIX = 'wallet_nonce:'


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
