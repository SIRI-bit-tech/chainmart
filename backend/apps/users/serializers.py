from rest_framework import serializers
from .models import UserProfile, UserNotificationPreference

class UserProfileSerializer(serializers.ModelSerializer):
    is_seller = serializers.BooleanField(read_only=True)
    is_buyer = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'display_name', 'avatar', 'bio',
            'wallet_address', 'role', 'reputation_score', 'total_transactions',
            'email_verified', 'wallet_verified', 'is_seller', 'is_buyer', 'created_at'
        ]
        read_only_fields = ['id', 'reputation_score', 'total_transactions', 'created_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['display_name', 'avatar', 'bio']


class UserNotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotificationPreference
        fields = '__all__'
