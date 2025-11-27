from django.contrib import admin
from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'recipient', 'is_read', 'created']
    list_filter = ['is_read', 'created']
    search_fields = ['sender__username', 'recipient__username', 'content']
    readonly_fields = ['created', 'modified']
    ordering = ['-created']
    
    fieldsets = (
        ('Message Information', {
            'fields': ('sender', 'recipient', 'content')
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Timestamps', {
            'fields': ('created', 'modified'),
            'classes': ('collapse',)
        }),
    )
