from django.contrib import admin
from .models import BlockchainTransaction


@admin.register(BlockchainTransaction)
class BlockchainTransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_hash', 'order', 'from_address', 'to_address', 'amount', 'status', 'block_number', 'created']
    list_filter = ['status', 'created']
    search_fields = ['transaction_hash', 'from_address', 'to_address', 'order__order_id']
    readonly_fields = ['transaction_hash', 'block_number', 'gas_used', 'created', 'modified']
    ordering = ['-created']
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('order', 'transaction_hash', 'status')
        }),
        ('Addresses', {
            'fields': ('from_address', 'to_address')
        }),
        ('Payment', {
            'fields': ('amount', 'token')
        }),
        ('Blockchain Details', {
            'fields': ('block_number', 'gas_used')
        }),
        ('Timestamps', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        # Blockchain transactions should only be created programmatically
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of blockchain records
        return False
