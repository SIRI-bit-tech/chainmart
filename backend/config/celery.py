import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('chainmart')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Periodic tasks
app.conf.beat_schedule = {
    'check-pending-transactions': {
        'task': 'apps.blockchain.tasks.check_pending_transactions',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'sync-contract-events': {
        'task': 'apps.blockchain.tasks.sync_contract_events',
        'schedule': crontab(minute='*/10'),  # Every 10 minutes
    },
    'process-dispute-timeouts': {
        'task': 'apps.orders.tasks.process_dispute_timeouts',
        'schedule': crontab(hour='*/1'),  # Every hour
    },
    'send-notification-digests': {
        'task': 'apps.realtime.tasks.send_notification_digests',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM
    },
}
