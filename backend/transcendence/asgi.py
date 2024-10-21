import os, django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter #, get_default_application
from channels.auth import AuthMiddlewareStack
from .middleware import TokenAuthMiddleware
from channels.security.websocket import AllowedHostsOriginValidator
import chat.routing
import tournament.routing
import accounts.routing
import tournament_match.routing
import local_match.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')
django.setup()

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            URLRouter(
                chat.routing.websocket_urlpatterns +
                tournament.routing.websocket_urlpatterns +
                tournament_match.routing.websocket_urlpatterns +
                local_match.routing.websocket_urlpatterns +
                accounts.routing.websocket_urlpatterns
            )
        )
    )
})
