from django.db import models
from django_extensions.db.models import TimeStampedModel
from apps.users.models import UserProfile
from apps.products.models import Product

class Order(TimeStampedModel):
    """Product orders with blockchain integration"""
    
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('PAYMENT_HELD', 'Payment Held'),
        ('COMPLETED', 'Completed'),
        ('DISPUTED', 'Disputed'),
        ('REFUNDED', 'Refunded'),
        ('CANCELLED', 'Cancelled'),
    )
    
    DISPUTE_CHOICES = (
        ('NONE', 'None'),
        ('RAISED', 'Raised'),
        ('INVESTIGATING', 'Investigating'),
        ('RESOLVED', 'Resolved'),
    )
    
    order_id = models.CharField(max_length=100, unique=True, db_index=True)
    listing_id = models.CharField(max_length=100, db_index=True)
    
    buyer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='purchases')
    seller = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sales')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=10)
    payment_token = models.CharField(max_length=42)  # Smart contract address
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PAYMENT_HELD', db_index=True)
    dispute_status = models.CharField(max_length=20, choices=DISPUTE_CHOICES, default='NONE')
    
    transaction_hash = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    disputer = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='initiated_disputes')
    dispute_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'orders_order'
        indexes = [
            models.Index(fields=['buyer', '-created']),
            models.Index(fields=['seller', '-created']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Order {self.order_id}"
