from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Tournament, Match, Player
from .serializers import TournamentSerializer, MatchSerializer, PlayerSerializer
from accounts.models import User, UserStats
from django.utils import timezone
from rest_framework.permissions import AllowAny
from math import log2, ceil
from django.db import transaction

@api_view(['GET'])
def get_tournaments(request):
    tournaments = Tournament.objects.all().order_by('id')
    serializer = TournamentSerializer(tournaments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_tournament_by_id(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        serializer = TournamentSerializer(tournament)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_tournament_by_status(request, tournament_status):
    try:
        tournaments = Tournament.objects.filter(status=tournament_status).order_by('-id')
        serializer = TournamentSerializer(tournaments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_players_by_tournament(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)

        players = Player.objects.filter(tournament=tournament)

        serializer = PlayerSerializer(players, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def create_tournament(request):
    try:
        name = request.data.get('name')
        max_size = request.data.get('max_size')
        host = User.objects.get(id=request.user.id)

        if Tournament.objects.filter(name=name).exists():
            return Response({'error': 'Tournament with this name already exists'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        tournament = Tournament.objects.create(
            name=name,
            max_size=max_size,
            current_size=0,
            status='upcoming',
            host=host,
            has_spawned=False
        )

        serializer = TournamentSerializer(tournament)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_tournament(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        if tournament.host.id != request.user.id:
            return Response({'error': 'Only the host can delete this tournament'}, status=status.HTTP_403_FORBIDDEN)
        tournament.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def add_player_to_tournament(request):
    try:
        tournament_id = request.data['tournament_id']
        nickname = request.data.get('nickname', 'ERR')
        user_id = request.user.id

        tournament = Tournament.objects.get(id=tournament_id)
        if tournament.has_spawned == True:
            return Response({'error': 'Has already spawned'}, status=status.HTTP_400_BAD_REQUEST)
        if Player.objects.filter(tournament=tournament, nickname=nickname).exists():
            return Response({'error': 'Player with this nickname already exists'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
        if tournament.max_size > tournament.current_size:
            user = User.objects.get(id=user_id)
            player, created = Player.objects.get_or_create(
                user=user,
                tournament=tournament,
                nickname=nickname
            )
            if not created:
                return Response({'error': 'Player already exists in this tournament'}, status=status.HTTP_400_BAD_REQUEST)

            tournament.current_size += 1
            tournament.save()

            serializer = TournamentSerializer(tournament)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'It is full'}, status=status.HTTP_400_BAD_REQUEST)
    except KeyError:
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def remove_player_from_tournament(request):
    try:
        tournament_id = request.data['tournament_id']
        user_id = request.data['user_id']

        tournament = Tournament.objects.get(id=tournament_id)
        if tournament.has_spawned:
            return Response({'error': 'Has already spawned'}, status=status.HTTP_400_BAD_REQUEST)

        player = Player.objects.get(user__id=user_id, tournament=tournament)
        player.delete()

        tournament.current_size -= 1
        tournament.save()

        serializer = TournamentSerializer(tournament)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except KeyError:
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_matchs(request):
    if request.method == 'GET':
        matches = Match.objects.all()
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

@api_view(['GET'])
# for testing
#@permission_classes([AllowAny])
def get_matches_by_tournament(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        matches = Match.objects.filter(tournament=tournament).order_by('id')
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_match_by_id(request, match_id):
    try:
        match = Match.objects.get(id=match_id)
        serializer = MatchSerializer(match)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Match.DoesNotExist:
        return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@transaction.atomic
def create_matches(request):
    try:
        tournament = Tournament.objects.get(id=request.data['tournament_id'])
        if tournament.has_spawned:
            return Response({'error': 'Matches have already been created'}, status=status.HTTP_400_BAD_REQUEST)

        players = list(Player.objects.filter(tournament=tournament))
        tournament_size = tournament.max_size

        # Calculate the number of rounds
        num_rounds = ceil(log2(tournament_size))

        # Create matches for all rounds
        for round_num in range(1, num_rounds + 1):
            match_index = 0  # Reset match index for each round

            if round_num == 1:
                # First round matches
                for i in range(0, len(players), 2):
                    player1 = players[i]
                    player2 = players[i+1] if i+1 < len(players) else None  # Handle odd number of players

                    match = Match.objects.create(
                        tournament=tournament,
                        round=round_num,
                        index=match_index,  # Index related to this round only
                        player1=player1,
                        player2=player2,
                        match_date=timezone.now()
                    )

                    # Print debug information for each match created
                    # print(f"Created match: Round {match.round}, Index {match.index}, Players: {match.player1} vs {match.player2}", flush=True)

                    match_index += 1
            else:
                # Future round matches
                num_matches = tournament_size // (2 ** round_num)
                for _ in range(num_matches):
                    match = Match.objects.create(
                        tournament=tournament,
                        round=round_num,
                        index=match_index,  # Index related to this round only
                        player1=None,
                        player2=None,
                        match_date=timezone.now()
                    )

                    # Print debug information for each match created
                    # print(f"Created match: Round {match.round}, Index {match.index}, Players: {match.player1} vs {match.player2}", flush=True)

                    match_index += 1

        tournament.status = "ongoing"
        tournament.has_spawned = True
        tournament.save()

        return Response({'message': f'Matches created for {num_rounds} rounds'}, status=status.HTTP_201_CREATED)

    except KeyError:
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error occurred: {e}", flush=True)
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
# permission for testing
#@permission_classes([AllowAny])
def delete_matches(request, tournament_id):
    try:
        tournament = Tournament.objects.get(id=tournament_id)
        matches = Match.objects.filter(tournament=tournament)
        matches.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Tournament.DoesNotExist:
        return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def submit_match_result(request):
    try:
        match = Match.objects.get(id=request.data['match_id'])

        if match.winner is not None:
            print(f"Match result already submitted", flush=True)
            return Response({f'message': 'Match result already submitted'}, status=status.HTTP_200_OK)

        user = User.objects.get(username=request.data['winner_username'])
        print(f"User found: {user.username}", flush=True)
        winner = Player.objects.get(user=user, tournament=match.tournament)

        match.winner = winner
        print(f"Assigned winner: {match.winner.user.username}", flush=True)
        match.save()

        # Update the UserStats for the winner
        winner_stats = UserStats.objects.get(user=winner.user)
        winner_stats.games_won += 1
        winner_stats.games_played += 1
        winner_stats.rating += 100
        winner_stats.save()
        print(f"winner rating : {winner_stats.rating}", flush=True)

        # Update the UserStats for the loser
        loser = match.player1.user if match.player2.user.id == winner.user.id else match.player2.user
        loser_stats = UserStats.objects.get(user=loser)
        loser_stats.games_lost += 1
        loser_stats.games_played += 1
        if loser_stats.rating < 50:
            loser_stats.rating = 0
        else:
            loser_stats.rating -= 50
        loser_stats.save()
        print(f"loser rating : {loser_stats.rating}", flush=True)

        tournament = match.tournament
        print(f"tournament : {tournament.name}", flush=True)
        current_round = match.round
        # Calculate the total number of rounds for this tournament
        total_rounds = ceil(log2(tournament.max_size))

        # Check if the current round is the last round
        if current_round == total_rounds:
            # If this is the last round, the tournament is over
            print(f"Final Round: {current_round}", flush=True)
            tournament.status = 'finished'
            tournament.winner = user
            tournament.save()
            print(f"*** Tournament Winner: {winner.user.username} ***", flush=True)
            return Response({'message': f'Tournament has ended. Winner: {winner.user.username}'}, status=status.HTTP_200_OK)

        return Response({'message': 'Result submitted'}, status=status.HTTP_200_OK)
    except Match.DoesNotExist:
        return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

    except User.DoesNotExist:
        return Response({'error': 'Winner user not found'}, status=status.HTTP_404_NOT_FOUND)

    except Player.DoesNotExist:
        return Response({'error': 'Winner player not found in the tournament'}, status=status.HTTP_404_NOT_FOUND)

    except KeyError as e:
        return Response({'error': f'Missing field: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



def get_next_match(tournament, current_round, match_index):
    # Calculate the next round index
    next_round = current_round + 1

    # Calculate the next match index
    next_match_index = match_index // 2

    try:
        # Retrieve the match for the next round (do not create it)
        next_match = Match.objects.get(
            tournament=tournament,
            round=next_round,
            index=next_match_index
        )

        # Print details about the next match if found
        # print(f"[NEXT MATCH] : round {next_match.round}, index: {next_match.index}", flush=True)

        return next_match, False  # False because it wasn't created, just retrieved

    except Match.DoesNotExist:
        # Handle the case where the match doesn't exist
        print(f"Error: Next match for round {next_round} and index {next_match_index} not found.", flush=True)
        return None, False



@api_view(['POST'])
@transaction.atomic
def advance_winner_to_next_round(request):
    try:
        match = Match.objects.get(id=request.data['match_id'])

        if match.tournament.status == 'finished':
            return Response({'tournament is over'}, status=status.HTTP_200_OK)
        elif match.winner is None:
            return Response({'error': 'Match does not have a winner yet'}, status=status.HTTP_400_BAD_REQUEST)

        tournament = match.tournament
        current_round = match.round
        match_index = match.index

        # Calculate the total number of rounds for this tournament
        total_rounds = ceil(log2(tournament.max_size))

        # Check if the current round is the last round
        if current_round == total_rounds:
            # If this is the last round, the tournament is over
            winner = match.winner
            match.tournament.status = 'finished'
            match.tournament.save()
            return Response({'message': f'Tournament has ended. Winner: {winner.user.username}'}, status=status.HTTP_200_OK)

        # Retrieve the next match based on the current round and match index
        next_match, created = get_next_match(tournament, current_round, match_index)

        if not next_match:
            return Response({'error': 'Next match could not be retrieved'}, status=status.HTTP_400_BAD_REQUEST)

        # Place the winner in the next round's match
        if match_index % 2 == 0:
            next_match.player1 = match.winner
        else:
            next_match.player2 = match.winner

        next_match.save()

        return Response({'message': f'Winner advanced to round {next_match.round} in match {next_match.id}'}, status=status.HTTP_201_CREATED)

    except Match.DoesNotExist:
        return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)
    except KeyError:
        return Response({'error': 'Invalid data provided'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
