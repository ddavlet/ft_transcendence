"""
ASGI config for transcendence_server project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from game.consumers.matchmaking import MatchmakingConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence_server.settings')

# application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path('game/matchmaking/', MatchmakingConsumer.as_asgi()),
            # path('ws/game/<game_id>/', GameConsumer.as_asgi()),
        ])
    ),
})
