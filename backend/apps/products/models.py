from django.db import models
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from django_extensions.db.models import TimeStampedModel
from apps.users.models import UserProfile

class Product(TimeStampedModel):
    """Product listings"""
    
    CATEGORY_CHOICES = (
        ('electronics', 'Electronics'),
        ('clothing', 'Clothing & Fashion'),
        ('books', 'Books & Media'),
        ('art', 'Art & Design'),
        ('collectibles', 'Collectibles'),
        ('services', 'Services'),
        ('other', 'Other'),
    )
    
    seller = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='products')
    listing_id = models.CharField(max_length=100, unique=True, db_index=True)
    title = models.CharField(max_length=500)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(
        max_length=10,
        choices=[('MATIC', 'MATIC'), ('USDC', 'USDC'), ('USDT', 'USDT'), ('ETH', 'ETH')],
        default='MATIC'
    )
    
    # Images
    thumbnail = models.URLField(blank=True, null=True)
    images = models.JSONField(default=list)  # Array of image URLs
    
    # Metadata
    product_hash = models.CharField(max_length=100, db_index=True)  # IPFS hash
    stock = models.IntegerField(default=1)
    
    # Stats
    rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    sale_count = models.IntegerField(default=0)
    
    is_active = models.BooleanField(default=True, db_index=True)
    search_vector = SearchVectorField(null=True, blank=True)
    
    class Meta:
        db_table = 'products_product'
        indexes = [
            models.Index(fields=['seller', '-created']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
            GinIndex(fields=['search_vector']),
        ]
        ordering = ['-created']
    
    def __str__(self):
        return f"{self.title} - {self.seller.username}"


class ProductImage(TimeStampedModel):
    """Product images stored on Cloudinary"""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_images')
    url = models.URLField()
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'products_productimage'
        ordering = ['order']
