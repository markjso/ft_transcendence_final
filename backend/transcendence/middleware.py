from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        # Decode the token
        token = UntypedToken(token_key)
        # Get the user ID from the token
        user_id = token.payload['user_id']
        # Get the user object
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Extract the token from the query string
        query_string = parse_qs(scope['query_string'].decode())
        token_key = query_string.get('token')

        # If a token is found, get the associated user
        if token_key:
            scope['user'] = await get_user(token_key[0])
        else:
            scope['user'] = AnonymousUser()

        # Call the next middleware or consumer
        return await super().__call__(scope, receive, send)
