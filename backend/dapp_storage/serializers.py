from typing import Any
from rest_framework import serializers
from .models import DeployedContract

class DeployedContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeployedContract
        fields = ['id', 'name', 'address']

class TournamentScoreSerializer(serializers.BaseSerializer):
    def to_internal_value(self, data):
        try:
            tournament_id = int(data.get('tournament_id'))
            if tournament_id == None:
                raise serializers.ValidationError({"tournament_id": "Field is required"})
            if tournament_id < 0:
                raise serializers.ValidationError({"tournament_id": "Score can't be a negative number"})
            if tournament_id > 65535:
                raise serializers.ValidationError({"tournament_id": "Score is too large and unsupported"})
        except ValueError:
            raise serializers.ValidationError({"tournament_id": "Must be a number"})

        try:
            tournament_name = str(data.get('tournament_name'))
            if not tournament_name or tournament_name == "":
                raise serializers.ValidationError({"tournament_name": "Field is required"})
        except ValueError:
            raise serializers.ValidationError({"tournament_name": "Must be a string"})

        try:
            player1 = str(data.get('player1'))
            if not player1 or player1 == "":
                raise serializers.ValidationError({"player1": "Field is required"})
        except ValueError:
            raise serializers.ValidationError({"player1": "Must be a string"})

        try:
            score1 = int(data.get('score1'))
            if score1 == None:
                raise serializers.ValidationError({"score1": "Field is required"})
            if score1 < 0:
                raise serializers.ValidationError({"score_1": "Score can't be a negative number"})
            if score1 > 65535:
                raise serializers.ValidationError({"score_1": "Score is too large and unsupported"})
        except ValueError:
            raise serializers.ValidationError({"score_1": "Must be a number"})

        try:
            player2 = str(data.get('player2'))
            if not player2 or player2 == "":
                raise serializers.ValidationError({"player2": "Field is required"})
        except ValueError:
            raise serializers.ValidationError({"player2": "Must be a string"})

        try:
            score2 = int(data.get('score2'))
            if score2 == None:
                raise serializers.ValidationError({"score2": "Field is required"})
            if score2 < 0:
                raise serializers.ValidationError({"score2": "Score can't be a negative number"})
            if score2 > 65535:
                raise serializers.ValidationError({"score2": "Score is too large and unsupported"})
        except ValueError:
            raise serializers.ValidationError({"score2": "Must be a number"})

        return {
            'tournament_id': tournament_id,
            'tournament_name': tournament_name,
            'player1': player1,
            'score1': score1,
            'player2': player2,
            'score2': score2
        }

