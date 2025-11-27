from rest_framework import serializers
from .models import Order
from apps.users.serializers import UserProfileSerializer
from apps.products.serializers import ProductListSerializer

class OrderSerializer(serializers.ModelSerializer):
    buyer = UserProfileSerializer(read_only=True)
    seller = UserProfileSerializer(read_only=True)
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'listing_id', 'buyer', 'seller', 'product',
            'amount', 'currency', 'status', 'dispute_status', 'transaction_hash',
            'created_at', 'completed_at', 'dispute_reason'
        ]
        read_only_fields = ['id', 'order_id', 'transaction_hash', 'created_at', 'completed_at']
