from django.contrib import admin
from .models import RealtimeEvent


@admin.register(RealtimeEvent)
class RealtimeEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'timestamp']
    list_filter = ['event_type', 'timestamp']
    search_fields = ['event_type', 'data']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']
    
    fieldsets = (
        ('Event Information', {
            'fields': ('event_type', 'data')
        }),
        ('Timestamp', {
            'fields': ('timestamp',)
        }),
    )
    
    def has_add_permission(self, request):
        # Realtime events should only be created programmatically
        return False
