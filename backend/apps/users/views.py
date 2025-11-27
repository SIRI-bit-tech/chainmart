from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import UserProfile, UserNotificationPreference
from .serializers import UserProfileSerializer, UserProfileUpdateSerializer, UserNotificationPreferenceSerializer

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
        """Verify wallet ownership via signature"""
        try:
            from web3 import Web3
            
            signature = request.data.get('signature')
            message = request.data.get('message')
            wallet_address = request.data.get('wallet_address')
            
            if not all([signature, message, wallet_address]):
                return Response(
                    {'error': 'Missing required fields'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify signature
            w3 = Web3()
            recovered_address = w3.eth.account.recover_message(
                encode_defunct(text=message),
                signature=signature
            )
            
            if recovered_address.lower() != wallet_address.lower():
                return Response(
                    {'error': 'Invalid signature'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update user
            request.user.wallet_address = wallet_address
            request.user.wallet_verified = True
            request.user.save()
            
            return Response(UserProfileSerializer(request.user).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
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
