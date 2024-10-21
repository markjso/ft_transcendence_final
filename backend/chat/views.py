from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework import status
from .models import Message, Room
from accounts.models import User
from .serializers import MessageSerializer, RoomSerializer
from django.db import IntegrityError
from friendship.models import Block
from django.core.paginator import Paginator
from django.db.models import Q
from friendship.models import Friend
from django.conf import settings


@api_view(['GET'])
def get_room_users(request, room_name):
	try:
		if not request.user.is_authenticated:
			return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)
		room = Room.objects.get(room_name=room_name)
		serializer = RoomSerializer(room)
		return Response({'users': serializer.data['users']}, status=status.HTTP_200_OK)
	except Room.DoesNotExist:
		return Response({'error': 'Room not found'}, status=404)

@api_view(['GET'])
#@permission_classes([AllowAny])
def get_messages(request, group_name):
	if request.user.is_authenticated:
		room = Room.objects.get(group_name=group_name)
		messages = Message.objects.filter(group_name=group_name).order_by('timestamp')
		serializer = MessageSerializer(messages, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_rooms(request):
	if request.user.is_authenticated:
		rooms = Room.objects.all()
		serializer = RoomSerializer(rooms, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_public_rooms(request):
	if request.user.is_authenticated:
		rooms = Room.objects.filter(isDirect=False).order_by('-id')
		serializer = RoomSerializer(rooms, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_public_rooms_filtered(request, qparams):
	if request.user.is_authenticated:
		rooms = Room.objects.filter(isDirect=False, room_name__startswith=qparams).order_by('-id')
		serializer = RoomSerializer(rooms, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def get_dm_rooms(request):
	if request.user.is_authenticated:
		rooms = Room.objects.filter(isDirect=True, users=request.user)
		serializer = RoomSerializer(rooms, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_dm_rooms_filtered(request, qparams):
	if request.user.is_authenticated:
		rooms = Room.objects.filter(isDirect=True, users=request.user, room_name__startswith=qparams)
		serializer = RoomSerializer(rooms, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_rooms_filtered(request, qparams):
	if request.user.is_authenticated:
		rooms = Room.objects.filter(room_name__startswith=qparams)
		serializer = RoomSerializer(rooms, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_room_by_name(request, room_name):
	if request.user.is_authenticated:
		room = get_object_or_404(Room, room_name=room_name)
		serializer = RoomSerializer(room)
		return Response(serializer.data, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def create_dm_room(request):
	if request.user.is_authenticated:
		print(request.data['friend'])
		second_user = None
		try:
			second_user = User.objects.get(username=request.data['friend'])
		except User.DoesNotExist:
			return Response({'error': 'Second user does not exist'}, status=status.HTTP_400_BAD_REQUEST)
		if Friend.objects.are_friends(request.user, second_user):
			if Room.objects.filter(users=request.user, isDirect=True).first():
				room = Room.objects.get(room_name=request.data['friend'])
				return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

			serializer = RoomSerializer(data=request.data)
			if serializer.is_valid():
				room = serializer.save()
				room.users.add(request.user)
				room.users.add(second_user)  # Add the second user
				room.isDirect = True
				room.save()
				return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
		else:
			return Response({'Error': 'users are not friends'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def create_room(request):
	if request.user.is_authenticated:
		print(request.data['room_name'])
		if Room.objects.filter(room_name=request.data['room_name']).exists():
			room = Room.objects.get(room_name=request.data['room_name'])
			return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
		is_direct = request.data.get('isDirect', False)
		serializer = RoomSerializer(data=request.data)
		if serializer.is_valid():
			room = serializer.save()
			room.users.add(request.user)
			if is_direct:
				try:
					second_user = User.objects.get(username=request.data['room_name'])
					room.users.add(second_user)  # Add the second user
				except User.DoesNotExist:
					return Response({'error': 'Second user does not exist'}, status=status.HTTP_400_BAD_REQUEST)
				room.isDirect = True
				room.save()
			return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def join_dm_room(request, other_username):
	if request.user.is_authenticated:
		room = get_object_or_404(Room, room_name=request.data['room_name'])
		otherUser = User.objects.get(username=other_username)
		if request.user in room.users.all() and otherUser in room.users.all():
			return Response({'message': 'Room already exists with these users'}, status=status.HTTP_200_OK)
		room.users.add(request.user)
		room.users.add(otherUser)
		room.save()
		return Response({'message': 'User added to room'}, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def join_room(request, room_id):
	if request.user.is_authenticated:
		room = get_object_or_404(Room, id=room_id)
		if room.users.filter(id=request.user.id).exists():
			return Response({'message': 'User is already in the room'}, status=status.HTTP_200_OK)
		room.users.add(request.user)
		room.save()
		return Response({'message': 'User added to room'}, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def leave_room(request, room_id):
	if request.user.is_authenticated:
		room = get_object_or_404(Room, id=room_id)
		username = request.data.get('username')
		user_to_remove = get_object_or_404(User, username=username)
		room.users.remove(user_to_remove)
		room.save()
		return Response({'message': 'User removed from room'}, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['DELETE'])
def delete_room(request, room_name):
	if request.user.is_authenticated:
		try:
			room = Room.objects.get(name=room_name)
			room.delete()
			return Response(status=status.HTTP_204_NO_CONTENT)
		except Room.DoesNotExist:
			return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_block_list(request):
	try:
		user = request.user
	except User.DoesNotExist:
		return Response({'Error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
	blocks = Block.objects.filter(blocker=user)
	blocked = [b.blocked for b in blocks]
	response = {
		'blocked_users': [b.username for b in blocked]
	}
	return Response(response, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_paginated_list_of_rooms(request):
	rooms_list = Room.objects.all()
	paginator = Paginator(rooms_list, 25)

	page_number = request.GET.get("page")
	page_obj = paginator.get_page(page_number)
	return Response(page_obj, status=status.HTTP_200_OK)

from accounts.serializers import UserSerializer

# @login_required
@api_view(['GET'])
def chat_view(request, chatroom_name='public_chat'):
	if request.user.is_authenticated:
		chat_room = get_object_or_404(Room, group_name=chatroom_name)
		if not request.user in chat_room.users.all():
			return Response({"error": "room not found"}, status=status.HTTP_404_NOT_FOUND)

		blocks = Block.objects.filter(blocker=request.user)
		blocked = [b.blocked for b in blocks]
		chat_messages = Message.objects.filter(room=chat_room).order_by('timestamp').exclude(sender__in=[b.id for b in blocked])
		messages = MessageSerializer(chat_messages, many=True)		
		serilizedroom = RoomSerializer(chat_room).data

		if chat_room.isDirect:
			for user in chat_room.users.all():
				if user != request.user:
					serilizedroom['name'] = user.username
					if user.image_url == "default.png":
						serilizedroom['image'] = f"{settings.CN_URL}/static/default.png"
					else:
						serilizedroom['image'] = f"{settings.CN_URL}/media/{user.image_url}"
					break
		else:
			serilizedroom['name'] = chat_room.groupchat_name

		context = {
			'roomDets': serilizedroom,
			'chat_messages' : messages.data,
		}
		return Response(context, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

# @login_required
@api_view(['POST'])
def get_or_create_chatroom(request, username):
	if request.user.is_authenticated:
		if request.user.username == username:
			return Response({'error': 'Can not message your self'}, status=status.HTTP_400_BAD_REQUEST)
		second_user = None
		try:
			second_user = User.objects.get(username=username)
		except User.DoesNotExist:
			return Response({'error': 'user does not exist'}, status=status.HTTP_400_BAD_REQUEST)

		my_chatrooms = request.user.chat_rooms.filter(isDirect=True)
		if my_chatrooms.exists():
			for chatroom in my_chatrooms:
				if second_user in chatroom.users.all():
					# chatroom = chatroom
					return Response({'chatroom': chatroom.group_name}, status=status.HTTP_200_OK)
		
		if Friend.objects.are_friends(request.user, second_user):
			chatroom = Room.objects.create(isDirect=True)
			chatroom.users.add(second_user, request.user)
			return Response({'chatroom': chatroom.group_name}, status=status.HTTP_201_CREATED)
		else:
			return Response({'error': "you must be friends to create message room"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
	return Response({'error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

# try using add(people, many=True)
@api_view(['POST'])
def create_groupchat(request):
	if request.user.is_authenticated:
		people = request.data['people']
		groupchat_name = request.data['groupchat_name']
		
		if (people and groupchat_name):
			chatroom = Room.objects.create(groupchat_name=groupchat_name)
			chatroom.users.add(request.user)
			chatroom.admin = request.user
			chatroom.save()
			second_user = None
			for person in people:
				try:
					second_user = User.objects.get(username=person)
					chatroom.users.add(second_user)          
				except User.DoesNotExist:
					return Response({'error': 'Second user does not exist'}, status=status.HTTP_400_BAD_REQUEST)
		  
			return Response({'chatroom': chatroom.group_name}, status=status.HTTP_201_CREATED)
		return Response({'Error': 'users and chatroom name is needed'}, status=status.HTTP_400_BAD_REQUEST)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED) 
	   

# @login_required
@api_view(['GET'])
def get_direct_rooms(request):
	if request.user.is_authenticated:
		direct_rooms = []
		for room in request.user.chat_rooms.all():
			if room.isDirect:
				for user in room.users.all():
					if (user != request.user):
						context = {"name": user.username, "group_name": room.group_name, "id": room.id}
						direct_rooms.append(context)
		return Response({"rooms": direct_rooms}, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED) 

@api_view(['GET'])
def get_rooms(request):
	if request.user.is_authenticated:
		rooms = []
		blocks = Block.objects.filter(blocker=request.user)
		blocked = [b.blocked for b in blocks]
		
		name = None
		image = None
		for room in request.user.chat_rooms.all():
			if room.isDirect:
				for user in room.users.all():
					if (user != request.user):
						if not user in blocked:
							name = user.username
							image = f"{settings.CN_URL}/static/default.png" if user.image_url == "default.png" else f"{settings.CN_URL}/media/{str(user.image_url)}"
			else:
				name = room.groupchat_name
				image = f"{settings.CN_URL}/static/groupicon.png" if room.image == "groupicon.png" else f"{settings.CN_URL}/media/{str(room.image)}"
			context = {"name": name, "group_name": room.group_name, "id": room.id, "image": image}
			rooms.append(context)
						
		return Response({"rooms": rooms}, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['Post'])
def leave_room(request, chatroom_name='public_chat'):
	if request.user.is_authenticated:
		chat_group = get_object_or_404(Room, group_name=chatroom_name)
		
		if request.user not in chat_group.users.all():
			return Response({'Error': 'room not found'}, status=status.HTTP_404_NOT_FOUND)
	
		chat_group.users.remove(request.user)
		return Response({'message': 'user removed'}, status=status.HTTP_200_OK)
	
	
@api_view(['Delete'])
def chatroom_delete(request, chatroom_name):
	if request.user.is_authenticated:
		chat_group = get_object_or_404(Room, group_name=chatroom_name)
		if request.user != chat_group.admin:
			return Response({'Error': 'room not found'}, status=status.HTTP_404_NOT_FOUND)

		chat_group.delete()
		return Response({'message': 'room deleted'}, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['Post'])
def chatroom_edit(request, chatroom_name):
	if request.user.is_authenticated:
		chat_group = get_object_or_404(Room, group_name=chatroom_name)
		if request.user != chat_group.admin:
			return Response({'Error': 'room not found'}, status=status.HTTP_404_NOT_FOUND)
		
		toRemove = request.data['toRemove']
		for user_id in toRemove:
			user = User.objects.get(id=user_id)
			chat_group.users.remove(user)
		newGroupName = request.data['roomname']
		if newGroupName:
			chat_group.groupchat_name = newGroupName
		chat_group.save()
		return Response({'message': 'room update'}, status=status.HTTP_200_OK)
	 

@api_view(['POST'])
def GroupPicUpdate(request, group_name):
	if request.user.is_authenticated:
		group_pic = request.data.get('image')
		if group_pic is not None:
			try:
				room = Room.objects.get(group_name=group_name)
				if room.image:
					room.image.delete(save=False)
				room.image = group_pic
				room.save()
				serializer = RoomSerializer(room)
				return Response(serializer.data, status=status.HTTP_201_CREATED)
			except:
				return Response({'Error': 'room not found'}, status=status.HTTP_404_NOT_FOUND)
		return Response({"error": "must upload image"}, status=status.HTTP_400_BAD_REQUEST)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)
