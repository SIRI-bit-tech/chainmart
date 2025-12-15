from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import URLValidator
from django_extensions.db.models import TimeStampedModel

class UserProfile(AbstractUser):
    """Extended user model with Web3 integration"""
    
    ROLE_CHOICES = (
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    )
    
    wallet_address = models.CharField(
        max_length=42,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text='Ethereum wallet address'
    )
    display_name = models.CharField(max_length=255, blank=True)
    avatar = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='buyer')
    email_verified = models.BooleanField(default=False)
    wallet_verified = models.BooleanField(default=False)
    profile_completed = models.BooleanField(default=False)
    reputation_score = models.IntegerField(default=0)
    total_transactions = models.IntegerField(default=0)
    is_suspended = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Fix reverse accessor clashes
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='userprofile_set',
        related_query_name='userprofile',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='userprofile_set',
        related_query_name='userprofile',
    )
    
    class Meta:
        db_table = 'users_userprofile'
        indexes = [
            models.Index(fields=['wallet_address']),
            models.Index(fields=['email']),
            models.Index(fields=['reputation_score']),
        ]
    
    def __str__(self):
        return f"{self.display_name or self.username} ({self.wallet_address})"
    
    @property
    def is_seller(self):
        return self.role == 'seller' or hasattr(self, 'seller_profile')
    
    @property
    def is_buyer(self):
        return self.role in ('buyer', 'seller')

    @property
    def kyc_status(self):
        if hasattr(self, 'kyc_record'):
            return self.kyc_record.status
        return 'unsubmitted'


class WalletSignature(TimeStampedModel):
    """Stores wallet verification signatures"""
    
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='wallet_signature')
    wallet_address = models.CharField(max_length=42, db_index=True)
    message = models.TextField()
    signature = models.TextField()
    verified_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'users_walletsignature'


class UserNotificationPreference(TimeStampedModel):
    """User notification preferences"""
    
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='notification_preferences')
    email_orders = models.BooleanField(default=True)
    email_messages = models.BooleanField(default=True)
    email_disputes = models.BooleanField(default=True)
    push_orders = models.BooleanField(default=True)
    push_messages = models.BooleanField(default=True)
    digest_frequency = models.CharField(
        max_length=20,
        choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('never', 'Never')],
        default='daily'
    )
    
    class Meta:
        db_table = 'users_notificationpreference'


class KYCVerification(TimeStampedModel):
    """Basic KYC record tied to a user account"""

    STATUS_CHOICES = (
        ('unsubmitted', 'Unsubmitted'),
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )

    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='kyc_record')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unsubmitted')
    provider = models.CharField(max_length=50, blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=2, blank=True)
    document_type = models.CharField(max_length=50, blank=True)
    document_number = models.CharField(max_length=64, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'users_kycverification'
