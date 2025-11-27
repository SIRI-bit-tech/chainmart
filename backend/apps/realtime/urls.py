from django.urls import path

websocket_urlpatterns = [
    path('ws/orders/<int:user_id>/', 'apps.realtime.consumers.OrderConsumer.as_asgi'),
    path('ws/products/', 'apps.realtime.consumers.ProductConsumer.as_asgi'),
]
