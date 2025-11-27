from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.products.models import Product
import asyncio
from config.socketio_config import emit_product_update

@receiver(post_save, sender=Product)
def product_inventory_changed(sender, instance, **kwargs):
    """Emit product update when inventory changes"""
    try:
        product_data = {
            'id': instance.id,
            'name': instance.name,
            'stock': instance.stock,
            'price': str(instance.price),
            'updated_at': instance.updated_at.isoformat(),
        }
        
        loop = asyncio.new_event_loop()
        loop.run_until_complete(emit_product_update(product_data))
        loop.close()
        
        print(f"[v0] Emitted product update for product {instance.id}")
    except Exception as e:
        print(f"[v0] Error emitting product update: {str(e)}")
