# # chat/consumers.py
import json

from channels.db import database_sync_to_async
from django.db import transaction
from asgiref.sync import async_to_sync
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer, JsonWebsocketConsumer, WebsocketConsumer
from channels.exceptions import StopConsumer
from django.shortcuts import get_object_or_404

from accounts.models import User
from .models import Room, Message
from friendship.models import Block
from .serializers import MessageSerializer
from accounts.serializers import UserSerializer

class ChatConsumer(JsonWebsocketConsumer):
	"""
	This consumer is used to show user's online status,
	and send notifications.
	"""

class ChatConsumer(WebsocketConsumer):
	def connect(self):
		if not self.scope['user'].is_authenticated:
			self.close()
			raise StopConsumer('User is not authenticated')
		self.user = self.scope['user']
		self.chatroom_name = self.scope['url_route']['kwargs']['room_id']
		self.chatroom = get_object_or_404(Room, group_name=self.chatroom_name)

		async_to_sync(self.channel_layer.group_add)(
            self.chatroom_name, self.channel_name
        )

		if self.user not in self.chatroom.users_online.all():
			self.chatroom.users_online.add(self.user)
			self.update_online_count()
   
		self.accept()

	def disconnect(self, close_code):
		 # Leave room group
		async_to_sync(self.channel_layer.group_discard)(
			self.chatroom_name, self.channel_name
		)
		if self.user in self.chatroom.users_online.all():
			self.chatroom.users_online.remove(self.scope['user'])
			self.update_online_count()

	# Receive message from WebSocket
	def receive(self, text_data):
		if not self.scope['user'].is_authenticated:
			self.close()
			raise StopConsumer('User is not authenticated')

		text_data_json = json.loads(text_data)
		action = text_data_json.get("action")

		if action == 'chat.message':
			newmessage = text_data_json["message"]
			timestamp = text_data_json['timestamp']
			message = Message.objects.create(
       			message = newmessage,
          		sender = self.scope['user'],
            	room = self.chatroom,
            	timestamp = timestamp
            )

			sender_username = text_data_json["sender_username"]
			# Send message to room group
			async_to_sync(self.channel_layer.group_send)(
				self.chatroom_name,
				{
					"type": "chat_message",
					"sender_username": sender_username,
					"message": newmessage,
					"timestamp": timestamp
				}
			)
   
		elif action == 'user.leave':
			async_to_sync(self.channel_layer.group_send)(
				self.chatroom_name,
				{
					'type': 'user_leave',  # Event type
					'username': self.scope['user'].username,
					'message': f"{self.scope['user'].username} has left the chat"
				}
			)
		elif action == 'user.join':
			async_to_sync(self.channel_layer.group_send)(
				self.chatroom_name,
				{
					'type': 'user_join',  # Event type
					'username': self.scope['user'].username,
					'message': f"{self.scope['user'].username} has joined the chat"
				}
			)
		elif action == 'game.invite':
			inviter = text_data_json.get('inviter')
			invitee = text_data_json.get('invitee')
			message = text_data_json.get('message')
			async_to_sync(self.channel_layer.group_send)(
				self.chatroom_name,
				{
					'type': 'game_invite',  # Event type
					'inviter': inviter,
					'invitee': invitee,
					'message': message
				}
			)

	# Receive message from room group
 
	def chat_message(self, event):
		sender_username = event['sender_username']
		message = event["message"]
		timestamp = event['timestamp']

		sender = User.objects.get(username=sender_username)
		serializer_data = self.serialize_user(sender)

		# Send message to WebSocket
		self.send(text_data=json.dumps({
			"sender": serializer_data,
			"message": message,
			"timestamp": timestamp
		}))

	# Send the message to WebSocket
	async def user_join(self, event):
		await self.send(text_data=json.dumps({
			'type': 'user.join',
			'username': event['username'],  # Data from the event
			'message': event['message']  # Data from the event
		}))

	async def user_leave(self, event):
		await self.send(text_data=json.dumps({
			'type': 'user.leave',
			'username': event['username'],  # Data from the event
			'message': event['message']  # Data from the event
		}))

	async def game_invite(self, event):
		inviter = event['inviter']
		invitee = event['invitee']
		message = event['message']

		await self.send(text_data=json.dumps({
			"type": "game.invite",
			"inviter": inviter,
			"invitee": invitee,
			"message": message
		}))

	@database_sync_to_async
	def get_user(self, username):
		try:
			return User.objects.get(username=username)
		except User.DoesNotExist:
			return None

	@database_sync_to_async
	def save_message(self, chatroom_name, sender_username, message, timestamp):
		room = Room.objects.get(group_name=chatroom_name)
		sender = User.objects.get(username=sender_username)
		new_message = Message.objects.create(
				room=room,
				sender=sender,
				message=message,
				timestamp=timestamp
			)
		return new_message

	@database_sync_to_async
	def is_blocked(self, blocker, blockee):
		try:
			print(f"{blocker, blockee}")
			blocker_user = User.objects.get(username=blocker)
			blockee_user = User.objects.get(username=blockee)
		except User.DoesNotExist:
			return False
		try:
			return Block.objects.filter(blocker=blocker_user, blocked=blockee_user).exists()
		except Block.DoesNotExist:
			return False

	# @database_sync_to_async

	def update_online_count(self):
		online_count = self.chatroom.users_online.count() - 1
		event = {
			'type': 'online_count_handler',
            'online_count': online_count
		}
		async_to_sync(self.channel_layer.group_send)(self.chatroom_name, event)
	
	def online_count_handler(self, event):
		online_count = event['online_count']
		
		self.send(text_data=json.dumps({
			"type": "online_count",
			'online_count' : online_count,
		}))
	
	def serialize_user(self, user):
		serializer = UserSerializer(user)
		return serializer.data