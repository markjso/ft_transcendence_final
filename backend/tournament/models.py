# models.py
from django.db import models
from accounts.models import User

class Tournament(models.Model):
    name = models.CharField(max_length=100, unique=True)
    max_size = models.IntegerField()
    current_size = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default='upcoming')
    host = models.ForeignKey(User, related_name='host', on_delete=models.CASCADE)
    has_spawned = models.BooleanField(default=False)
    winner = models.ForeignKey(User, related_name='winner', on_delete=models.CASCADE, null=True)

class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=50, default="")

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    round = models.IntegerField()
    index = models.IntegerField()
    player1 = models.ForeignKey(Player, related_name='player1', on_delete=models.CASCADE, null=True)
    player2 = models.ForeignKey(Player, related_name='player2', on_delete=models.CASCADE, null=True)
    winner = models.ForeignKey(Player, related_name='winner', on_delete=models.SET_NULL, null=True)
    match_date = models.DateTimeField()
    notified = models.BooleanField(default=False)
