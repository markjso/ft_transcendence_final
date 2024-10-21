from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group, Permission
from django.core.validators import MaxValueValidator, MinValueValidator
from .manager import UserManager
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken
from PIL import Image
# from django.utils.translation import gettext
# Create your models here.

AUTH_PROVIDERS = {'email':'email', 'google':'google', 'github':'github'} #TODO add 42

# because i want to create my user model from scratch I have to use abstract base user model
class User(AbstractBaseUser, PermissionsMixin):
	email=models.EmailField(max_length=255, unique=True, verbose_name=_("Email Address"))
	username = models.CharField(max_length=50, unique=True)
	nickname = models.CharField(max_length=50, unique=True, null=True, blank=True, default="")
	first_name = models.CharField(max_length=100, verbose_name=_("First Name"))
	last_name = models.CharField(max_length=100, verbose_name=_("Last Name"))
	is_staff = models.BooleanField(default=False)
	is_superuser = models.BooleanField(default=False)
	is_verified = models.BooleanField(default=False)
	is_active = models.BooleanField(default=True) #if not true then the user can not login
	is_online = models.BooleanField(default=False)
	date_joined = models.DateTimeField(auto_now_add=True)
	last_login = models.DateTimeField(auto_now=True)
	auth_provider = models.CharField(max_length=50, default=AUTH_PROVIDERS.get("email"))
	groups = models.ManyToManyField(Group, related_name='custom_user_set', blank=True)
	user_permissions = models.ManyToManyField(Permission, related_name='custom_user_set', blank=True)
	image_url = models.ImageField(upload_to='profile_pics', default='default.png')

	USERNAME_FIELD = "email"

	REQUIRED_FIELDS = ["username", "first_name", "last_name"]

	objects = UserManager()

	def __str__(self):
		return self.email

	@property
	def get_full_name(self):
		return f"{self.first_name} {self.last_name}"

	def tokens(self):
		refresh = RefreshToken.for_user(self)
		return {
			'refresh': str(refresh),
			'access': str(refresh.access_token)
		}

class OneTimePassword(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	code = models.CharField(max_length=6, unique=True)

	def __str__(self):
		return f"{self.user.first_name}-passcode"

class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile_image") # Delete profile when user is deleted
	image_url = models.ImageField(upload_to='profile_pics', default='')
	image_url_42 = models.URLField(max_length=2000, default='')

class UserStats(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	games_won = models.IntegerField(default=0, validators=[MaxValueValidator(50)])
	games_lost = models.IntegerField(default=0, validators=[MaxValueValidator(49)])
	games_played = models.IntegerField(default=0, validators=[MaxValueValidator(99)])
	rating = models.IntegerField(default=1000, validators=[MinValueValidator(0), MaxValueValidator(5000)])

	def __str__(self):
		return f'Games Played: {self.games_played}, Games Won: {self.games_won}, Games Lost: {self.games_lost}'
