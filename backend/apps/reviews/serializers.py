from rest_framework import serializers
from .models import ProductReview

class ProductReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.display_name', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = ['id', 'rating', 'comment', 'reviewer_name', 'helpful_count', 'created_at']
