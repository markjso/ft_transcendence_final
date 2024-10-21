import requests
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed
from accounts.models import User, Profile, UserStats
from django.contrib.auth import authenticate
from io import BytesIO
from urllib.request import urlopen
from django.core.files import File

def add_profile_image(user, img_URL):
	response =urlopen(img_URL)
	io = BytesIO(response.read())
	user.image_url.save("fortytwo", File(io))

def RegisterSocialAccount(email, username, nickname, firstName, lastName, img_URL):
	user = User.objects.filter(email=email)
	if user.exists():
		register_userd=authenticate(email=email, password=settings.SOCIAL_AUTH_PASSWORD)
		tokens = register_userd.tokens()
		print(register_userd)
		return {
			'id':register_userd.id,
			'full_name':register_userd.get_full_name,
			'username': register_userd.username,
			'email':register_userd.email,
			'auth_provider': '42',
			'access_token': str(tokens.get('access')),
			'refresh_token': str(tokens.get('refresh'))
		}
	else:
		user = {
			'email': email,
			'username': username,
   			'nickname': nickname,
			'first_name': firstName,
			'last_name': lastName,
			'password': settings.SOCIAL_AUTH_PASSWORD,
			'auth_provider': '42',
		}
		user = User.objects.create_user(**user)
		user.is_verified = True
		user.is_online = True
		add_profile_image(user, img_URL)
		user.save()
		login_user = authenticate(email=email, password=settings.SOCIAL_AUTH_PASSWORD)

		tokens = login_user.tokens()
		UserStats.objects.create(user=user)
		return {
			'id': login_user.id,
			'email': login_user.email,
			'username': login_user.username,
			'full_name': login_user.get_full_name,
			'access_token': str(tokens.get('access')),
			'refresh_token': str(tokens.get('refresh'))
		}


from rest_framework.exceptions import AuthenticationFailed
import requests
from django.conf import settings

class SocialAccount42():
	@staticmethod
	def TokenFromCode(code):
		# try:
			Params = {
				"grant_type": "authorization_code",
				"client_id": settings.CLIENT_ID_42,
				"client_secret": settings.CLIENT_SECRET_42,
				"code": code,
				"redirect_uri": f"https://{settings.DOMAIN}/42"
			}
			response = requests.post("https://api.intra.42.fr/oauth/token", params=Params, headers={'Accept': 'application/json'})
			access_token = response.json().get('access_token')
			if not access_token:
				raise AuthenticationFailed(response.json(), 401)
				# raise AuthenticationFailed("Access token not found in the response", 401)
			return access_token

	@staticmethod
	def Get42User(accessToken):
		response = requests.get("https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {accessToken}"})
		response.raise_for_status()  # Raise an exception for HTTP errors
		return response.json()

# grant_type 	string 	Required. The grant type. In this case, it's authorization_code.
# client_id 	string 	Required. The client ID you received from 42 when you registered.
# client_secret 	string 	Required. The client secret you received from 42 when you registered.
# code 	string 	Required. The code you received as a response to Step 1.
# redirect_uri 	string 	The URL in your app where users will be sent after authorization.
# state 	string 	The unguessable random string you optionally provided in Step 1.
