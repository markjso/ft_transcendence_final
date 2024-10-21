import json
from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Tournament, User, Player
from asgiref.sync import sync_to_async
from .serializers import TournamentSerializer

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Authentication check
        if not self.scope['user'].is_authenticated:
            await self.close()
            raise StopConsumer('User is not authenticated')

        self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        self.tournament_group_name = f'tournament_{self.tournament_id}'

        # Join tournament group
        await self.channel_layer.group_add(
            self.tournament_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave tournament group
        await self.channel_layer.group_discard(
            self.tournament_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        username = data.get('username')

        try:
            if action == 'match':
                tournament_id = data.get('tournament_id')
                await self.channel_layer.group_send(
                    self.tournament_group_name,
                    {
                        'type': 'match_update',
                        'message': tournament_id
                    }
                )
                return
            elif action == 'leave':
                await self.remove_player(username)

            # Fetch and serialize the updated tournament asynchronously
            tournament = await sync_to_async(Tournament.objects.get)(id=self.tournament_id)
            serializer_data = await sync_to_async(self.serialize_tournament)(tournament)

            await self.channel_layer.group_send(
                self.tournament_group_name,
                {
                    'type': 'tournament_update',
                    'message': serializer_data
                }
            )
        except Exception as e:
            print(f"Error during receive: {str(e)}", flush=True)
            await self.close()

    async def match_update(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'match',
            'message': message
        }))

    async def tournament_update(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'tournament.update',
            'message': message
        }))

    @sync_to_async
    def remove_player(self, username):
        tournament = Tournament.objects.get(id=self.tournament_id)
        player = Player.objects.get(user__username=username, tournament__id=self.tournament_id)
        player.delete()
        if tournament.current_size > 0:
            tournament.current_size -= 1
            tournament.save()

    def serialize_tournament(self, tournament):
        serializer = TournamentSerializer(tournament)
        return serializer.data
