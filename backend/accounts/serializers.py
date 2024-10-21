from rest_framework import serializers
from .models import User, Profile, UserStats
from django.contrib.auth import authenticate
from rest_framework.serializers import ModelSerializer
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework import status
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import smart_str, smart_bytes, force_str
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from .utils import send_normal_email
from django.conf import settings

class UserSerializer(ModelSerializer):
    image_url = serializers.SerializerMethodField('get_image_url')
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'nickname', 'is_online', 'email', 'image_url')
        extra_kwargs = {'password': {'write_only': True}}

    def get_image_url(self, obj):
        if obj.image_url == "default.png":
            return f"{settings.CN_URL}/static/default.png"
        return f"{settings.CN_URL}/media/{obj.image_url}"

"""
Purpose:
	#Handles user registration by validating and saving user data.
#Key Functions:
	#validate(attrs):
	#
		#Compares password and password2 fields to ensure they match.
		#Raises serializers.ValidationError if the passwords do not match.
		#Returns the validated data.
	#create(validated_data):
		#Creates a new user using the validated data.
		#Returns the created user instance.
"""
class UserRegisterationSerializer(serializers.ModelSerializer):
	password = serializers.CharField(max_length=68, min_length=6, write_only=True)
	password2 = serializers.CharField(max_length=68, min_length=6, write_only=True)

	class Meta:
		model = User
		fields = ['id', 'email', 'username', 'first_name', 'last_name', 'nickname', 'password', 'password2']

	# we need compare the two passwords the user provides
	def validate(self, attrs):
		password = attrs.get('password', '')
		password2 = attrs.get('password2', '')

		if password != password2:
			raise serializers.ValidationError("passwords do not match")
		return attrs

	def create(self, validated_data):
		user = User.objects.create_user(
			email = validated_data['email'],
			username = validated_data['username'],
			first_name = validated_data['first_name'],
			last_name = validated_data['last_name'],
			nickname=validated_data['username'],
			password = validated_data['password'],
		)
		UserStats.objects.create(user=user)
		return user

class VerifyEmailSerializer(serializers.Serializer):
	pass

"""
# Purpose:
	#Handles user login by validating credentials and generating JWT tokens.
#Key Functions:
	#validate(attrs):
	#Authenticates the user using email and password.
	#Raises AuthenticationFailed if the credentials are invalid or the email is not verified.
	#Generates JWT access and refresh tokens using the user's tokens method.
	#Returns a dictionary containing email, full_name, access_token, and refresh_token.
"""

class LoginSerializer(serializers.ModelSerializer):
	id = serializers.IntegerField(read_only=True)
	email = serializers.EmailField(max_length=255, min_length=6)
	username = serializers.CharField(max_length=150, read_only=True)
	nickname = serializers.CharField(max_length=150, read_only=True)
	password = serializers.CharField(max_length=68, write_only=True)
	full_name = serializers.CharField(max_length=255, read_only=True)
	access_token = serializers.CharField(max_length=255, read_only=True)
	refresh_token = serializers.CharField(max_length=255, read_only=True)

	class Meta:
		model = User
		fields = ['id', 'email', 'username', 'password', 'full_name', 'nickname', 'access_token', 'refresh_token']

	def validate(self, attrs):
		email = attrs.get('email')
		password = attrs.get('password')
		request = self.context.get('request')

		user = authenticate(request, email=email, password=password)
		if not user:
			raise AuthenticationFailed("Invalid credentials, please try again")
		if user.auth_provider == '42':
			raise PermissionDenied("please sign in using the 42 social link")
		if not user.is_verified:
			raise AuthenticationFailed("Email is not verified")

		user.is_online = True
		user.save()

		user_tokens = user.tokens()

		return {
			'id': user.id,
			'email': user.email,
			'username': user.username,
			'full_name': user.get_full_name,
			'nickname': user.nickname,
			'access_token': str(user_tokens.get('access')),
			'refresh_token': str(user_tokens.get('refresh'))
		}

"""
# Purpose:
# Handles password reset requests by generating a password reset link and sending it via email.
# Key Functions:
	# validate(attrs):
		# Validates the email field.
		# If a user with the provided email exists, generates a password reset token and link.
		# Sends the password reset link via email using the send_normal_email function.
		# Calls super().validate(attrs) to ensure standard validation is performed.
"""
class PasswordResetRequestSerializer(serializers.Serializer):
	email = serializers.EmailField(max_length=255)

	class Meta:
		fields = ['email']
	def validate(self, attrs):
		email = attrs.get('email')
		if User.objects.filter(email=email).exists():
			user = User.objects.get(email=email)
			if user.auth_provider == '42':
				raise serializers.PermissionDenied("user has registered with 42 social account can not change password")
			uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
			token = PasswordResetTokenGenerator().make_token(user)
			abslink = f"{settings.PASSWORD_RESET_BASE_URL}/{uidb64}/{token}/"
			email_body = f"hi use the link below to reset your password \n {abslink}"
			data = {
				'email_body': email_body,
				'email_subject': "Reset your Password",
				'to_email': user.email
			}
			send_normal_email(data)
		return super().validate(attrs)
"""
# Purpose:
	# Handles setting a new password using the password reset token.
# Key Functions:
	# validate(attrs):
		# Decodes the uidb64 to get the user ID.
		# Retrieves the user and checks if the reset token is valid.
		# Ensures that password and password2 match.
		# If valid, sets the new password for the user and saves it.
		# Raises AuthenticationFailed if the token is invalid, expired, or if passwords do not match.
		# Returns the user instance upon successful password reset.
"""
class SetNewPasswordSerializer(serializers.Serializer):
	password = serializers.CharField(max_length=100, min_length=6, write_only=True)
	password2 = serializers.CharField(max_length=100, min_length=6, write_only=True)
	uidb64 = serializers.CharField(write_only=True)
	token = serializers.CharField(write_only=True)

	class Meta:
		fields = ["password", "password2", "uidb64", "token"]

	def validate(self, attrs):
		try:
			token = attrs.get('token')
			uidb64 = attrs.get('uidb64')
			password = attrs.get('password')
			password2 = attrs.get('password2')
			user_id = force_str(urlsafe_base64_decode(uidb64))
			user = User.objects.get(id=user_id)
			if not PasswordResetTokenGenerator().check_token(user, token):
				raise AuthenticationFailed("reset link is invalid or has expired", 401)
			if password != password2:
				raise AuthenticationFailed("passwords do not match")
			user.set_password(password)
			user.save()
			return user
		except Exception as e:
			return AuthenticationFailed("Link is invalid or has expired")

"""
# Purpose:
	# Handles user logout by blacklisting the refresh token.
# Key Functions:
	# validate(attrs):
		# Retrieves and stores the refresh_token.
		# Returns the validated attributes.
	# save():
		# Attempts to blacklist the refresh token using RefreshToken.
		# If the token is invalid or expired, raises an error defined in default_error_message.
"""
class LogoutUserSerializer(serializers.Serializer):
	refresh_token = serializers.CharField()

	default_error_message = {
		'bad_token': ('Token is Invalid or has expired')
	}

	def validate(self, attrs):
		self.token = attrs.get('refresh_token')

		return attrs

	def save(self, **kwargs):
		try:
			token = RefreshToken(self.token)
			user_id = token.payload['user_id']
			user = User.objects.get(id=user_id)
			token.blacklist()
			user.is_online = False
			user.save()
		except TokenError:
			return self.fail('bad_token')

class UserProfileSerializer(serializers.ModelSerializer):
	image_url = serializers.ImageField(required=True)
	image_url_42 = serializers.URLField(required=False)

	class Meta:
		model = User
		fields = ('id', 'image_url', 'image_url_42')

class UserStatsSerializer(serializers.ModelSerializer):
	user = UserSerializer()

	class Meta:
		model = UserStats
		fields = ('user', 'games_played', 'games_won', 'games_lost', 'rating')
