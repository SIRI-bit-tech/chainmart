from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'buyer', 'seller', 'amount', 'currency', 'status', 'dispute_status', 'created']
    list_filter = ['status', 'dispute_status', 'currency', 'created']
    search_fields = ['order_id', 'listing_id', 'buyer__username', 'seller__username', 'transaction_hash']
    readonly_fields = ['order_id', 'transaction_hash', 'completed_at', 'created', 'modified']
    ordering = ['-created']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_id', 'listing_id', 'product')
        }),
        ('Parties', {
            'fields': ('buyer', 'seller')
        }),
        ('Payment', {
            'fields': ('amount', 'currency', 'payment_token')
        }),
        ('Status', {
            'fields': ('status', 'dispute_status')
        }),
        ('Blockchain', {
            'fields': ('transaction_hash', 'completed_at')
        }),
        ('Dispute', {
            'fields': ('disputer', 'dispute_reason'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of orders
        return False
