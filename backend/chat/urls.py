from django.urls import re_path, path

from . import views

urlpatterns = [
    path('users/<str:room_name>/', views.get_room_users, name='get_room_users'),
    path('messages/<group_name>/', views.get_messages, name='get_messages'),
    path('rooms/dm', views.get_dm_rooms, name='get_dm_rooms'),
    path('rooms/pub', views.get_public_rooms, name='get_public_rooms'),
    path('rooms/', views.get_rooms, name='get_rooms'),
    path('rooms/search/<str:qparams>', views.get_rooms_filtered, name='get_room_by_search_params'),
    path('rooms/search/dm/<str:qparams>', views.get_rooms_filtered, name='get_dm_room_by_search_params'),
    path('rooms/search/pub/<str:qparams>', views.get_rooms_filtered, name='get_pub_room_by_search_params'),
    path('rooms/<str:room_name>/', views.get_room_by_name, name='get_room_by_name'),
    path('create_room/', views.create_room, name='create_room'),
    path('create_dm_room/', views.create_dm_room, name='create_dm_room'),
    path('join_dm_room/<str:other_username>/', views.join_dm_room, name='join_dm_room'),
    path('join_room/<int:room_id>/', views.join_room, name='join_room'),
    path('leave_room/<int:room_id>/', views.leave_room, name='leave_room'),
    path('delete_room/<int:room_id>/', views.delete_room, name='delete_room'), 
    path('chat/room/<chatroom_name>/', views.chat_view, name="chatroom"),
    path('chat/create/group/', views.create_groupchat, name="start-group-chat"),
    path('chat/create/<username>/', views.get_or_create_chatroom, name="start-chat"),
    path('chat/directRooms/', views.get_direct_rooms, name="list_direct_rooms"),
    path('chat/rooms/', views.get_rooms, name="list_rooms"),
    path('chat/leave/<chatroom_name>/', views.leave_room, name="leave_a_room"),
    path('chat/delete/<chatroom_name>/', views.chatroom_delete, name="delete_a_room"),
    path('chat/chatroom_edit/<chatroom_name>/', views.chatroom_edit, name="edit_a_room"),
    path('chat/GroupPicUpdate/<group_name>/', views.GroupPicUpdate, name="update_group_pic"),
]