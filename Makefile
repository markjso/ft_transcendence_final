all:
	@docker compose up --build

detach:
	@docker compose up --build -d

down:
	@docker compose down --volumes

re-build: down all

watch:
	@docker compose up --watch

pop:
	@docker exec -it django python manage.py populate_users

clean: down
	@docker system prune -a

fclean: down
	@docker system prune -f -a --volumes

.PHONY: all detach down re-build watch clean fclean
