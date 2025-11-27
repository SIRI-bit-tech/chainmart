from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile, WalletSignature, UserNotificationPreference


@admin.register(UserProfile)
class UserProfileAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'display_name', 'wallet_address', 'role', 'reputation_score', 'is_active']
    list_filter = ['role', 'email_verified', 'wallet_verified', 'is_suspended', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'wallet_address', 'display_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Web3 Information', {
            'fields': ('wallet_address', 'wallet_verified')
        }),
        ('Profile Information', {
            'fields': ('display_name', 'avatar', 'bio', 'role')
        }),
        ('Reputation', {
            'fields': ('reputation_score', 'total_transactions')
        }),
        ('Status', {
            'fields': ('email_verified', 'is_suspended')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'wallet_address', 'role')
        }),
    )


@admin.register(WalletSignature)
class WalletSignatureAdmin(admin.ModelAdmin):
    list_display = ['user', 'wallet_address', 'verified_at', 'expires_at']
    list_filter = ['verified_at', 'expires_at']
    search_fields = ['user__username', 'wallet_address']
    readonly_fields = ['created', 'modified']


@admin.register(UserNotificationPreference)
class UserNotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_orders', 'email_messages', 'push_orders', 'digest_frequency']
    list_filter = ['digest_frequency', 'email_orders', 'push_orders']
    search_fields = ['user__username', 'user__email']
