from django.db import models

class RealtimeEvent(models.Model):
    event_type = models.CharField(max_length=50)
    data = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'realtime_event'
