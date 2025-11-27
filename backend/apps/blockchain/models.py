from django.db import models
from django_extensions.db.models import TimeStampedModel
from apps.users.models import UserProfile
from apps.orders.models import Order

class BlockchainTransaction(TimeStampedModel):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='blockchain_tx')
    transaction_hash = models.CharField(max_length=100, unique=True, db_index=True)
    from_address = models.CharField(max_length=42)
    to_address = models.CharField(max_length=42)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    token = models.CharField(max_length=42)
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('failed', 'Failed')],
        default='pending'
    )
    block_number = models.IntegerField(null=True, blank=True)
    gas_used = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'blockchain_transaction'
