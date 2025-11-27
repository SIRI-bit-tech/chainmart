import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = f"orders_{self.scope['user'].id}"
        self.room_group_name = f"orders_{self.scope['user'].id}"
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    async def order_update(self, event):
        await self.send(text_data=json.dumps(event['data']))

class ProductConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = f"products"
        self.room_group_name = "products"
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    async def product_update(self, event):
        await self.send(text_data=json.dumps(event['data']))
