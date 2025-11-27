from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.orders.models import Order
import asyncio
from config.socketio_config import emit_order_update

@receiver(post_save, sender=Order)
def order_status_changed(sender, instance, created, **kwargs):
    """Emit order update when status changes"""
    try:
        order_data = {
            'id': instance.id,
            'status': instance.status,
            'total_price': str(instance.total_price),
            'updated_at': instance.updated_at.isoformat(),
        }
        
        # Run async function
        loop = asyncio.new_event_loop()
        loop.run_until_complete(emit_order_update(instance.buyer_id, order_data))
        loop.close()
        
        print(f"[v0] Emitted order update for user {instance.buyer_id}")
    except Exception as e:
        print(f"[v0] Error emitting order update: {str(e)}")
