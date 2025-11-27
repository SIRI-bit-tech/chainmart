from django.contrib import admin
from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['url', 'alt_text', 'order']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'category', 'price', 'currency', 'stock', 'rating', 'is_active', 'created']
    list_filter = ['category', 'currency', 'is_active', 'created']
    search_fields = ['title', 'description', 'seller__username', 'listing_id']
    readonly_fields = ['listing_id', 'product_hash', 'rating', 'review_count', 'sale_count', 'created', 'modified']
    list_editable = ['is_active']
    ordering = ['-created']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('seller', 'listing_id', 'title', 'description', 'category')
        }),
        ('Pricing', {
            'fields': ('price', 'currency', 'stock')
        }),
        ('Media', {
            'fields': ('thumbnail', 'images')
        }),
        ('Blockchain', {
            'fields': ('product_hash',)
        }),
        ('Statistics', {
            'fields': ('rating', 'review_count', 'sale_count')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'url', 'order', 'created']
    list_filter = ['created']
    search_fields = ['product__title', 'alt_text']
    ordering = ['product', 'order']
