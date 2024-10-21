from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from typing import List

from .serializers import TournamentScoreSerializer
from .deploy import DeployContract

# Create your views here.
@api_view(['POST'])
def post(request):
    deployed_contract = DeployContract()
    if deployed_contract.w3 is None or deployed_contract.contract is None:
        deployed_contract.deploy()

    serializer = TournamentScoreSerializer(data=request.data)

    if serializer.is_valid(raise_exception=True):
        validated_data = serializer.validated_data
        tournament_id = validated_data['tournament_id']
        tournament_name = validated_data['tournament_name']
        player1 = validated_data['player1']
        score1 = validated_data['score1']
        player2 = validated_data['player2']
        score2 = validated_data['score2']
        tx_hash = deployed_contract.add_score(tournament_id, tournament_name, player1, score1, player2, score2)
        return Response({'tx_hash': tx_hash}, status=status.HTTP_201_CREATED)

    return Response({"Invalid data."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get(request):
    deployed_contract = DeployContract()
    if deployed_contract.w3 is None or deployed_contract.contract is None:
        deployed_contract.deploy()

    tournament_id = int(request.query_params['tournament_id'])
    tournament_name = request.query_params['tournament_name']
    player1 = request.query_params['player1']
    player2 = request.query_params['player2']

    # Get score from the contract using ContractService
    score_from_contract = deployed_contract.get_score(tournament_id, tournament_name, player1, player2)

    if score_from_contract:
        score = {
            'tournament_id': score_from_contract[0],
            'tournament_name': score_from_contract[1],
            'player1': score_from_contract[2],
            'score1': score_from_contract[3],
            'player2': score_from_contract[4],
            'score2': score_from_contract[5],
        }
        return Response(score, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Score not found'}, status=status.HTTP_404_NOT_FOUND)
