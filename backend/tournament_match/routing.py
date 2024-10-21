from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from .consumers import PongConsumer

# Define WebSocket URL patterns
websocket_urlpatterns = [
    re_path(r'^ws/match/(?P<room_name>[\w-]+)/$', PongConsumer.as_asgi()),
]

# Set up the main application
application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # HTTP protocol handler
    "websocket": AuthMiddlewareStack(  # WebSocket protocol handler with authentication middleware
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
