from django.contrib import admin
from .models import SellerProfile, SellerReview


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'store_name', 'verified', 'response_time', 'created']
    list_filter = ['verified', 'created']
    search_fields = ['user__username', 'store_name']
    readonly_fields = ['created', 'modified']
    list_editable = ['verified']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Store Information', {
            'fields': ('store_name', 'store_description', 'store_banner')
        }),
        ('Status', {
            'fields': ('verified', 'response_time')
        }),
        ('Timestamps', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SellerReview)
class SellerReviewAdmin(admin.ModelAdmin):
    list_display = ['seller', 'reviewer', 'rating', 'created']
    list_filter = ['rating', 'created']
    search_fields = ['seller__username', 'reviewer__username', 'comment']
    readonly_fields = ['created', 'modified']
    ordering = ['-created']
