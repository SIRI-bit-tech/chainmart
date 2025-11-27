from rest_framework import serializers
from .models import Product, ProductImage
from apps.users.serializers import UserProfileSerializer

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'alt_text', 'order']

class ProductListSerializer(serializers.ModelSerializer):
    seller = UserProfileSerializer(read_only=True)
    images = ProductImageSerializer(source='product_images', many=True, read_only=True)
    seller_id = serializers.IntegerField(source='seller.id', read_only=True)
    seller_name = serializers.CharField(source='seller.display_name', read_only=True)
    seller_rating = serializers.FloatField(source='seller.reputation_score', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'listing_id', 'title', 'category', 'price', 'currency',
            'thumbnail', 'rating', 'review_count', 'sale_count',
            'seller', 'seller_id', 'seller_name', 'seller_rating', 'images', 'is_active'
        ]
        read_only_fields = ['id', 'listing_id', 'rating', 'review_count', 'sale_count']

class ProductDetailSerializer(serializers.ModelSerializer):
    seller = UserProfileSerializer(read_only=True)
    images = ProductImageSerializer(source='product_images', many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'listing_id', 'rating', 'review_count', 'sale_count', 'seller']

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['title', 'description', 'category', 'price', 'currency', 'thumbnail', 'stock']
