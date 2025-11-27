from django.db import models
from django_extensions.db.models import TimeStampedModel
from apps.users.models import UserProfile

class Message(TimeStampedModel):
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'messages_message'
        ordering = ['-created']
