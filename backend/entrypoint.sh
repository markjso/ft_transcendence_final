#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z ${SQL_HOST} ${SQL_PORT}; do
    sleep 0.1
done

echo "PostgreSQL has started"

export DJANGO_SETTINGS_MODULE=transcendence.settings

find . -path "*/migrations/*.py" -not -name "__init__.py" -delete;
find . -path "*/migrations/*.pyc"  -delete;
python manage.py makemigrations;
python manage.py migrate;

# python manage.py populate_users
# echo populated users

python manage.py collectstatic --noinput

echo collected all static files

exec "$@"


getenv()