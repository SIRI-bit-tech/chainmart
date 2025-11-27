from django.db import models
from django_extensions.db.models import TimeStampedModel
from apps.users.models import UserProfile

class SellerProfile(TimeStampedModel):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='seller_profile')
    store_name = models.CharField(max_length=255)
    store_description = models.TextField(blank=True)
    store_banner = models.URLField(blank=True, null=True)
    verified = models.BooleanField(default=False)
    response_time = models.IntegerField(default=0)  # in hours
    
    class Meta:
        db_table = 'sellers_sellerprofile'

class SellerReview(TimeStampedModel):
    seller = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='seller_reviews')
    reviewer = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    
    class Meta:
        db_table = 'sellers_sellerreview'
