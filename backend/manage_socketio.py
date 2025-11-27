#!/usr/bin/env python
import os
import asyncio
import django
from aiohttp import web
from config.socketio_config import sio

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()


async def create_app():
    app = web.Application()
    sio.attach(app)
    
    async def health(request):
        return web.json_response({'status': 'ok', 'service': 'chainmart'})
    
    app.router.add_get('/socket.io/', health)
    return app


if __name__ == '__main__':
    app = asyncio.run(create_app())
    web.run_app(app, host='0.0.0.0', port=8001)
