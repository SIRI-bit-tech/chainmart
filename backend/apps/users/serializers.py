from rest_framework import serializers
from .models import KYCVerification, UserProfile, UserNotificationPreference

class UserProfileSerializer(serializers.ModelSerializer):
    is_seller = serializers.BooleanField(read_only=True)
    is_buyer = serializers.BooleanField(read_only=True)
    kyc_status = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'display_name', 'avatar', 'bio',
            'wallet_address', 'role', 'reputation_score', 'total_transactions',
            'email_verified', 'wallet_verified', 'profile_completed', 'kyc_status',
            'is_seller', 'is_buyer', 'created_at'
        ]
        read_only_fields = ['id', 'reputation_score', 'total_transactions', 'created_at', 'email_verified', 'wallet_verified', 'profile_completed']

    def get_kyc_status(self, obj):
        return getattr(obj, 'kyc_status', 'unsubmitted')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['display_name', 'avatar', 'bio']


class UserNotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotificationPreference
        fields = '__all__'


class KYCVerificationSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)

    class Meta:
        model = KYCVerification
        fields = [
            'status',
            'provider',
            'full_name',
            'country',
            'document_type',
            'document_number',
            'date_of_birth',
            'verified_at',
            'rejection_reason',
        ]
        read_only_fields = ['verified_at', 'rejection_reason']
