import socketio
import os
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

# Create Socket.io server with CORS enabled
sio = socketio.AsyncServer(
    async_mode='aiohttp',
    cors_allowed_origins=os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
    ping_timeout=60,
    ping_interval=25,
    engineio_logger=False,
    logger=True,
)

# Dictionary to track connected users and their sockets
connected_users = {}


@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    try:
        # Extract token from auth header
        token = None
        if auth:
            token = auth.get('token')
        elif 'HTTP_AUTHORIZATION' in environ:
            auth_header = environ['HTTP_AUTHORIZATION']
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
        
        if not token:
            return False
        
        # Verify JWT token
        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user_id = validated_token.get('user_id')
            
            # Store user socket mapping
            connected_users[user_id] = sid
            await sio.save_session(sid, {'user_id': user_id, 'token': token})
            
            print(f"[v0] User {user_id} connected via Socket.io: {sid}")
            return True
        except (InvalidToken, AuthenticationFailed):
            print(f"[v0] Invalid token: {token}")
            return False
    except Exception as e:
        print(f"[v0] Connection error: {str(e)}")
        return False


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    session = await sio.get_session(sid)
    if session and 'user_id' in session:
        user_id = session['user_id']
        if user_id in connected_users:
            del connected_users[user_id]
        print(f"[v0] User {user_id} disconnected from Socket.io: {sid}")


@sio.event
async def subscribe_orders(sid, data):
    """Subscribe user to order updates"""
    session = await sio.get_session(sid)
    if session and 'user_id' in session:
        user_id = session['user_id']
        room = f'user_orders_{user_id}'
        sio.enter_room(sid, room)
        print(f"[v0] User {user_id} subscribed to orders room: {room}")
        await sio.emit('subscribed', {'room': room, 'type': 'orders'}, to=sid)


@sio.event
async def subscribe_products(sid, data):
    """Subscribe to product inventory updates"""
    session = await sio.get_session(sid)
    if session:
        sio.enter_room(sid, 'products_inventory')
        print(f"[v0] Client subscribed to products inventory room")
        await sio.emit('subscribed', {'room': 'products_inventory', 'type': 'products'}, to=sid)


@sio.event
async def subscribe_seller_sales(sid, data):
    """Subscribe seller to their sales updates"""
    session = await sio.get_session(sid)
    if session and 'user_id' in session:
        seller_id = session['user_id']
        room = f'seller_sales_{seller_id}'
        sio.enter_room(sid, room)
        print(f"[v0] Seller {seller_id} subscribed to sales room: {room}")
        await sio.emit('subscribed', {'room': room, 'type': 'seller_sales'}, to=sid)


@sio.event
async def ping(sid):
    """Respond to ping keep-alive"""
    await sio.emit('pong', {}, to=sid)


# Helper functions to emit events from backend
async def emit_order_update(user_id, order_data):
    """Emit order update to specific user"""
    room = f'user_orders_{user_id}'
    await sio.emit('order_updated', order_data, room=room)


async def emit_product_update(product_data):
    """Emit product inventory update to all subscribed clients"""
    await sio.emit('product_updated', product_data, room='products_inventory')


async def emit_seller_sale(seller_id, sale_data):
    """Emit new sale notification to seller"""
    room = f'seller_sales_{seller_id}'
    await sio.emit('new_sale', sale_data, room=room)


async def emit_to_user(user_id, event_name, data):
    """Emit custom event to specific user"""
    if user_id in connected_users:
        sid = connected_users[user_id]
        await sio.emit(event_name, data, to=sid)
