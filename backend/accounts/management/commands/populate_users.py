from django.core.management.base import BaseCommand
from accounts.models import User, UserStats

class Command(BaseCommand):
    help = 'Create random users'

    def handle(self, *args, **kwargs):
        for i in range(4):
            user = User.objects.create_superuser(
                email=f'test{i}@abc.com',
                username=f'test{i}',
                first_name=f'A{i}',
                last_name=f'Z{i}',
                password='abc123',
                is_verified=True,
                nickname=f'nick{i}',
            )

            UserStats.objects.create(
                user=user,
                games_won=i,
                games_lost=i,
                games_played=i*2,
            )
        self.stdout.write(self.style.SUCCESS('Successfully created 4 users'))
