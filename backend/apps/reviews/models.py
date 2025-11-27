from django.db import models
from django_extensions.db.models import TimeStampedModel
from apps.users.models import UserProfile
from apps.products.models import Product

class ProductReview(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    helpful_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'reviews_productreview'
