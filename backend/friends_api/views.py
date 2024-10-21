from typing import List
from django.shortcuts import render
from django.db import IntegrityError

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from friendship.models import Friend, Block

from accounts.models import User as User
from accounts.serializers import UserSerializer

# Create your views here.
@api_view(['POST'])
def add_friend(request, username):
	if not request.user.is_authenticated:
		return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)
	try:
		from_user = request.user
		to_user = User.objects.get(username=username)
	except User.DoesNotExist:
		return Response({'Error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
	if from_user == to_user:
		return Response({'Error': 'You cannot add yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)
	try:
		Friend.objects.create(from_user=from_user, to_user=to_user)
		Friend.objects.create(from_user=to_user, to_user=from_user)
	except IntegrityError:
		return Response({'Error': 'Friendship already exists'}, status=status.HTTP_400_BAD_REQUEST)
	return Response({'Friend added'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def remove_friend(request, username):
	if not request.user.is_authenticated:
		return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)
	try:
		from_user = request.user
		to_user = User.objects.get(username=username)
	except User.DoesNotExist:
		return Response({'Error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
	if from_user == to_user:
		return Response({'Error': 'You cannot remove yourself as a friend'}, status=status.HTTP_400_BAD_REQUEST)
	try:
		Friend.objects.remove_friend(from_user, to_user)
	except IntegrityError:
		return Response({'Error': 'Friendship does not exist'}, status=status.HTTP_400_BAD_REQUEST)
	return Response({'Friend removed'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_friends_list(request):
    if not request.user.is_authenticated:
        return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = request.user
    except User.DoesNotExist:
        return Response({'Error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    from_user_friends = Friend.objects.filter(from_user=user).select_related('to_user')
    to_user_friends = Friend.objects.filter(to_user=user).select_related('from_user')

    friends1 = [f.to_user for f in from_user_friends]
    friends2 = [f.from_user for f in to_user_friends]

    all_friends = set(friends1 + friends2)

    if user in all_friends:
        all_friends.remove(user)

    serialized_friends = UserSerializer(all_friends, many=True)

    return Response({'friends': serialized_friends.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
def block_user(request, username):
	if not request.user.is_authenticated:
		return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)
	try:
		blocker = request.user
		blocked = User.objects.get(username=username)
	except User.DoesNotExist:
		return Response({'Error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
	if blocker == blocked:
		return Response({'Error': 'You cannot block yourself'}, status=status.HTTP_400_BAD_REQUEST)
	try:
		Block.objects.create(blocker=blocker, blocked=blocked)
	except IntegrityError:
		return Response({'Error': 'Block already exists'}, status=status.HTTP_400_BAD_REQUEST)
	return Response({'success': 'User blocked'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def unblock_user(request, username):
	if not request.user.is_authenticated:
		return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)
	try:
		blocker = request.user
		blocked = User.objects.get(username=username)
	except User.DoesNotExist:
		return Response({'Error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
	if blocker == blocked:
		return Response({'Error': 'You cannot unblock yourself'}, status=status.HTTP_400_BAD_REQUEST)
	try:
		Block.objects.get(blocker=blocker, blocked=blocked).delete()
	except Block.DoesNotExist:
		return Response({'Error': 'Block does not exist'}, status=status.HTTP_400_BAD_REQUEST)
	return Response({'success': 'User unblocked'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_block_list(request):
    if not request.user.is_authenticated:
        return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = request.user
    except User.DoesNotExist:
        return Response({'Error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    blocks = Block.objects.filter(blocker=user).select_related('blocked')
    blocked_users = [b.blocked for b in blocks]

    serialized_blocked_users = UserSerializer(blocked_users, many=True)

    return Response({'blocked_users': serialized_blocked_users.data}, status=status.HTTP_200_OK)
