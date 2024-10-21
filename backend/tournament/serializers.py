from rest_framework import serializers
from .models import Tournament, Match, Player
from accounts.serializers import UserSerializer

class TournamentSerializer(serializers.ModelSerializer):
    host = UserSerializer()
    winner = UserSerializer()

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'max_size', 'current_size', 'status', 'host', 'has_spawned', 'winner']

class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    tournament = TournamentSerializer()

    class Meta:
        model = Player
        fields = ['user', 'tournament', 'nickname']

class MatchSerializer(serializers.ModelSerializer):
    tournament = TournamentSerializer()
    player1 = PlayerSerializer()
    player2 = PlayerSerializer()
    winner = PlayerSerializer()

    class Meta:
        model = Match
        fields = ['id', 'round', 'index', 'tournament', 'player1', 'player2', 'winner', 'match_date', 'notified']
