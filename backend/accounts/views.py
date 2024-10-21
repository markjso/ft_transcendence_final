from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import parser_classes, api_view
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from .utils import send_code_to_user
from .models import OneTimePassword, User, Profile, UserStats
from friendship.models import Friend
from .serializers import UserSerializer, UserRegisterationSerializer,\
							VerifyEmailSerializer, LoginSerializer,\
							PasswordResetRequestSerializer, SetNewPasswordSerializer,\
							LogoutUserSerializer, UserProfileSerializer, UserStatsSerializer
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework import viewsets

# Create your views here.
class UserDetailsView(APIView):
	def get(self, request, username):
		try:
			user = User.objects.get(username=username)
			serializer = UserSerializer(user)
			if (user != request.user):
				isFriend = False
				isFriend = Friend.objects.are_friends(request.user, user)
				serializer.data['isFriend'] = isFriend
			return Response(serializer.data, status=status.HTTP_200_OK)
		except User.DoesNotExist:
			return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterUserView(GenericAPIView):
	serializer_class = UserRegisterationSerializer
	permission_classes = [AllowAny]

	def post(self, request):
		user_data = request.data
		serializer = self.serializer_class(data=user_data)
		if serializer.is_valid(raise_exception=True):
			serializer.save()
			user = serializer.data
			send_code_to_user(user['email'])
			#send email function user['email']
			return Response({
				'data': user,
				'message': f'hi thanks for signing up a passcode has been sent to your email'
			}, status=status.HTTP_201_CREATED)
		# if something goes wrong
		return Response({'message': "ERROR with registration view"}, serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# delete the otp after verification
class VerifyUserEmail(GenericAPIView):
	serializer_class = VerifyEmailSerializer
	permission_classes = [AllowAny]

	def post(self, request):
		otp_code = request.data.get('otp')
		try:
			user_code_obj = OneTimePassword.objects.get(code=otp_code)
			user = user_code_obj.user
			if not user.is_verified:
				user.is_verified = True
				user.save()
				return Response({
					'message': 'account email verified successfully'
				}, status=status.HTTP_200_OK)
			return Response({
				'message': 'code is invalid, user already verified'
			}, status=status.HTTP_204_NO_CONTENT)
		except OneTimePassword.DoesNotExist:
			return Response({
				'message': 'passcode not provided'
			}, status=status.HTTP_404_NOT_FOUND)


class LoginUserView(GenericAPIView):
	serializer_class = LoginSerializer
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = self.serializer_class(data=request.data, context={'request':request})
		try:
			serializer.is_valid(raise_exception=True)
			return Response(serializer.data, status=status.HTTP_200_OK)
		except Exception as e:
			return Response({'error': 'Invalid credentials, please try again'}, status=status.HTTP_401_UNAUTHORIZED)


class PasswordResetRequestView(GenericAPIView):
	serializer_class = PasswordResetRequestSerializer
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = self.serializer_class(data=request.data, context={'request':request})
		serializer.is_valid(raise_exception=True)
		return Response({'message': "a link has been sent to your email to reset your password"}, status=status.HTTP_200_OK)


class PasswordResetConfirm(GenericAPIView):
	permission_classes = [AllowAny]

	def get(self, request, uidb64, token):
		try:
			user_id = urlsafe_base64_decode(uidb64)
			user = User.objects.get(id=user_id)
			if not PasswordResetTokenGenerator().check_token(user, token):
				return Response({'message': "token is invalid or has expired"}, status=status.HTTP_401_UNAUTHORIZED)
			return Response({'success': True, 'message': "credentials is valid", 'uidb64':uidb64, 'token':token}, status=status.HTTP_200_OK)
		except DjangoUnicodeDecodeError:
			return Response({'message': "token is invalid or has expired"}, status=status.HTTP_401_UNAUTHORIZED)


class SetNewPassword(GenericAPIView):
	serializer_class = SetNewPasswordSerializer
	permission_classes = [AllowAny]

	def patch(self, request):
		serializer = self.serializer_class(data=request.data)
		serializer.is_valid(raise_exception=True)
		return Response({'message': "password reset successful"}, status=status.HTTP_200_OK)

class LogoutUserView(GenericAPIView):
	serializer_class = LogoutUserSerializer
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = self.serializer_class(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response({'message': 'user successfully logged out'}, status=status.HTTP_200_OK)

class TestJWTAuth(GenericAPIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		data = {
			"message": "your token works"
		}
		return Response(data, status=status.HTTP_200_OK)

class UserStatsView(GenericAPIView):
	def get(self, request, username=None, format=None):
		if username is not None:
			user_stats = get_object_or_404(UserStats, user__username=username)
			serializer = UserStatsSerializer(user_stats)
		else:
			user_stats = UserStats.objects.order_by('-games_won')
			# user_stats = UserStats.objects.all()
			serializer = UserStatsSerializer(user_stats, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)

class UserProfileViewSet(viewsets.ModelViewSet):
	queryset = Profile.objects.order_by('-id')
	serializer_class = UserProfileSerializer
	parser_classes = (MultiPartParser, FormParser)
	permission_classes = [IsAuthenticatedOrReadOnly]

	def update(self, request, *args, **kwargs):
		partial = kwargs.pop('partial', False)
		instance = self.get_object()
		serializer = self.get_serializer(instance, data=request.data, partial=partial)
		serializer.is_valid(raise_exception=True)

		# Handle image update
		if 'image_url' in request.data:
			if instance.image_url:  # Check if there's an existing image
				instance.image_url.delete(save=False)  # Delete the old image

		self.perform_update(serializer)

		headers = self.get_success_headers(serializer.data)
		return Response(
			{
				"message": "Your image updated successfully"
			},
			status=status.HTTP_200_OK,
			headers=headers
		)

	def get_object(self):
		# Override get_object to get the profile of the current user
		return Profile.objects.get(user=self.request.user)

class UpdateProfilePicView(APIView):
	permission_classes = [IsAuthenticated]

	def patch(self, request, format=None):
		profile, created = Profile.objects.get(user=request.user)
		profile_pic = request.data.get('image_url')
		if profile_pic is not None:
			profile.profile_pic = profile_pic
			profile.save()

		serializer = UserProfileSerializer(profile)
		return Response(serializer.data, status=status.HTTP_200_OK)

	def get_object(self):
		profile, created = Profile.objects.get_or_create(user=self.request.user)
		return profile

def get_profile_data(user):
	profile, created = Profile.objects.get_or_create(user=user)
	serializer = UserProfileSerializer(profile)
	data = serializer.data
	image_url_42 = data.get('image_url_42')
	image_url = data.get('image_url')

	if not image_url:
		image_url = '/static/default.png'
	return {'id': data.get('id'), 'image_url': f"http://localhost{image_url}"}

class ProfilePicView(APIView):
	permission_classes = [IsAuthenticated]

	def get_object(self):
		profile, created = Profile.objects.get_or_create(user=self.request.user)
		return profile

	def get(self, request, format=None):
		profile_data = get_profile_data(self.request.user)
		return Response(profile_data)
	
	def post(self, request, format=None):
		profile = self.get_object()
		profile_pic = request.data.get('image_url')
		if profile_pic is not None:
			if profile.image_url:
				profile.image_url.delete(save=False)
			profile.image_url = profile_pic
			profile.save()

		serializer = UserProfileSerializer(profile)
		return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateNicknameView(APIView):
	def post(self, request, *args, **kwargs):
		user = request.user
		new_nickname = request.data.get('nickname')

		if new_nickname is not None:
			user.nickname = new_nickname
			user.save()
			return Response({"message": "Nickname updated successfully"}, status=status.HTTP_200_OK)

		return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def UserProfilePic(request):
	if request.user.is_authenticated:
		profile_pic = request.data.get('image_url')
		if profile_pic is not None:
			user = User.objects.get(email=request.user)
			if user.image_url:
				user.image_url.delete(save=False)
			user.image_url = profile_pic
			user.save()
			serializer = UserSerializer(user)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response({"error": "must upload image"}, status=status.HTTP_400_BAD_REQUEST)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)
		
	
@api_view(['GET'])
def GetAllUsers(request, qparam):
	if request.user.is_authenticated:
		users = User.objects.filter(username__startswith=qparam).exclude(username=request.user.username)
		serializer = UserSerializer(users, many=True, read_only=True)
		return Response(serializer.data, status=status.HTTP_200_OK)
	return Response({'Error': 'HTTP_401_UNAUTHORIZED'}, status=status.HTTP_401_UNAUTHORIZED)
		
