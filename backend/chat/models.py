from django.db import models
from accounts.models import User
import shortuuid
class Room(models.Model):
    group_name = models.CharField(max_length=128, unique=True, blank=True)
    groupchat_name = models.CharField(max_length=128, null=True, blank=True)
    room_name = models.CharField(max_length=100)
    isDirect = models.BooleanField(default=False)
    admin = models.ForeignKey(User, related_name='groupchats', blank=True, null=True, on_delete=models.SET_NULL)
    users_online = models.ManyToManyField(User, related_name='online_in_groups', blank=True)
    image = models.ImageField(default="groupicon.png", upload_to='chatroom_image')
    users = models.ManyToManyField(User, related_name="chat_rooms")

    def save(self, *args, **kwargs):
        if not self.group_name:
            self.group_name = shortuuid.uuid()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.group_name

class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(max_length=300, blank=True, null=True)
    timestamp = models.DateTimeField()

    def __str__(self):
        return f'[{self.timestamp}] {self.sender} : {self.message}'
