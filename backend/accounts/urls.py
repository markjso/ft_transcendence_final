from django.urls import path, include
from .views import RegisterUserView, UserDetailsView, VerifyUserEmail, LoginUserView,  PasswordResetConfirm, PasswordResetRequestView, SetNewPassword, LogoutUserView, TestJWTAuth, UserProfileViewSet, UserStatsView, UpdateProfilePicView, ProfilePicView, UpdateNicknameView, GetAllUsers, UserProfilePic
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
# router.register(r'profile/pic', UserProfileViewSet, basename='profile')

urlpatterns = [
	path('register/', RegisterUserView.as_view(), name='register'),
	path('user/<str:username>/', UserDetailsView.as_view(), name='user'),
	path('verify-email/', VerifyUserEmail.as_view(), name='verify-email'),
	path('login/', LoginUserView.as_view(), name="login"),
	path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
	path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirm.as_view(), name='password-reset-confirm'),
	path('set-new-password/', SetNewPassword.as_view(), name='set-new-password'),
	path('logout/', LogoutUserView.as_view(), name='logout'),
	path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
	path('JWT-test/', TestJWTAuth.as_view(), name="test"),
    path('userstats/', UserStatsView.as_view(), name='user-stats'),
    path('profile/pic/', UserProfilePic, name='get-profile-pic'),
    path('profile/pic/update/', UpdateProfilePicView.as_view(), name='update-profile-pic'),
    path('update-nickname/', UpdateNicknameView.as_view(), name='update-nickname'),
    path('allusers/<str:qparam>', GetAllUsers, name='get_all_users'),
    path('', include(router.urls)),
]
