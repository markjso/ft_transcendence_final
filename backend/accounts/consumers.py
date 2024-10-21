import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.exceptions import StopConsumer
from tournament.models import Match
from asgiref.sync import sync_to_async

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if not self.scope['user'].is_authenticated:
            await self.close()
            raise StopConsumer('User is not authenticated')

        self.user = self.scope["user"]

        if self.user.is_authenticated:
            # Add the user to the group of online users
            await self.channel_layer.group_add("online_users", self.channel_name)
            await self.accept()

            # Notify that the user is online
            await self.channel_layer.group_send(
                "online_users",
                {
                    "type": "user_online",
                    "user_id": self.user.id,
                    "username": self.user.username
                }
            )
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            # Remove the user from the online group
            await self.channel_layer.group_discard("online_users", self.channel_name)

            # Notify that the user is offline
            await self.channel_layer.group_send(
                "online_users",
                {
                    "type": "user_offline",
                    "user_id": self.user.id,
                    "username": self.user.username
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        try:
            if action == 'next_match':
                tournament_id = data.get('tournament_id')
                match_id = data.get('match_id')
                player1_id = data.get('player1_id')
                player1_username = data.get('player1_username')
                player2_id = data.get('player2_id')
                player2_username = data.get('player2_username')

                await self.update_match_notified(match_id)

                await self.channel_layer.group_send(
                    "online_users",
                    {
                        "type": "notify_next_match",
                        "match_id": match_id,
                        "tournament_id": tournament_id,
                        "player1_id": player1_id,
                        "player1_username": player1_username,
                        "player2_id": player2_id,
                        "player2_username": player2_username,
                    }
                )
        except Exception as e:
            print(f"Error during receive: {str(e)}", flush=True)
            await self.close()


    async def user_online(self, event):
        # Handle when a user comes online
        await self.send(text_data=json.dumps({
            "type": "online",
            "user_id": event["user_id"],
            "username": event["username"]
        }))

    async def user_offline(self, event):
        # Handle when a user goes offline
        await self.send(text_data=json.dumps({
            "type": "offline",
            "user_id": event["user_id"],
            "username": event["username"]
        }))

    @sync_to_async
    def update_match_notified(self, match_id):
        # Update the `notified` field of the match instance
        try:
            match = Match.objects.get(id=match_id)
            match.notified = True
            match.save()
        except Match.DoesNotExist:
            print(f"Match with id {match_id} does not exist", flush=True)
        except Exception as e:
            print(f"Failed to update match notified status: {str(e)}", flush=True)

    async def notify_next_match(self, event):
        await self.send(text_data=json.dumps({
            "type": "next_match",
            "match_id": event["match_id"],
            "tournament_id": event["tournament_id"],
            "player1_id": event["player1_id"],
            "player1_username": event["player1_username"],
            "player2_id": event["player2_id"],
            "player2_username": event["player2_username"],
        }))
