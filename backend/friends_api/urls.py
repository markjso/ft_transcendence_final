from django.urls import path
from . import views

urlpatterns = [
	path('add/<str:username>/', views.add_friend, name='add_friend'),
	path('remove/<str:username>/', views.remove_friend, name='remove_friend'),
	path('friends/', views.get_friends_list, name='get_friends_list'),
	path('block/<str:username>/', views.block_user, name='block_user'),
	path('unblock/<str:username>/', views.unblock_user, name='unblock_user'),
	path('blocks/', views.get_block_list, name='get_block_list'),
]
