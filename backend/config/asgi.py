import os
import asyncio
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize Django ASGI app
django_asgi_app = get_asgi_application()

from aiohttp import web
from config.socketio_config import sio

async def create_app():
    app = web.Application()
    sio.attach(app)
    
    # Health check
    async def health(request):
        return web.json_response({'status': 'ok'})
    
    app.router.add_get('/health/', health)
    return app

# Export for production
async def application(scope, receive, send):
    """ASGI application that routes between HTTP and Socket.io"""
    if scope['type'] == 'http':
        await django_asgi_app(scope, receive, send)
    elif scope['type'] == 'lifespan':
        await django_asgi_app(scope, receive, send)
