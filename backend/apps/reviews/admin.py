from django.contrib import admin
from .models import ProductReview


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'reviewer', 'rating', 'helpful_count', 'created']
    list_filter = ['rating', 'created']
    search_fields = ['product__title', 'reviewer__username', 'comment']
    readonly_fields = ['created', 'modified']
    ordering = ['-created']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('product', 'reviewer', 'rating')
        }),
        ('Content', {
            'fields': ('comment', 'helpful_count')
        }),
        ('Timestamps', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )
