from django.urls import path
from . import views

urlpatterns = [
    path('tournaments/', views.get_tournaments, name='get_tournament'),
    path('tournament/<int:tournament_id>/', views.get_tournament_by_id, name='get_tournament_by_id'),
    path('status/<str:tournament_status>/', views.get_tournament_by_status, name='get_tournament_by_status'),
    path('tournament/<int:tournament_id>/players/', views.get_players_by_tournament, name='get_players_by_tournament'),
    path('create_tournament/', views.create_tournament, name='create_tournament'),
    path('delete_tournament/<int:tournament_id>/', views.delete_tournament, name='delete_tournament'),
    path('matches/', views.get_matchs, name='get_match'),
    path('matches/tournament/<int:tournament_id>/', views.get_matches_by_tournament, name='get_matches_by_tournament'),
    path('matches/match/<int:match_id>/', views.get_match_by_id, name='get_match_by_id'),
    path('matches/create/', views.create_matches, name='create_matches'),
    path('matches/delete/<int:tournament_id>/', views.delete_matches, name='delete_matches'),
    path('matches/submit/', views.submit_match_result, name='submit_match_result'),
    path('add_player_to_tournament/', views.add_player_to_tournament, name='add_player_to_tournament'),
    path('remove_player_from_tournament/', views.remove_player_from_tournament, name='remove_player_from_tournament'),

    #EXPERIMENTAL
    path('matches/advance/', views.advance_winner_to_next_round, name='advance_winner'),
]
