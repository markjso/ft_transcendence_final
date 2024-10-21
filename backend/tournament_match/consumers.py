import random
import json
import asyncio
from enum import Enum
from channels.generic.websocket import AsyncWebsocketConsumer

class GameState(Enum):
	MENU = 0
	PREGAME = 1
	IN_PROGRESS = 2
	PAUSE = 3
	GOAL_SCORED = 4
	POSTGAME = 5
	NOT_RUNNING = 6
	GAME_START = 7
	DISCONNECT = 8

class PongConsumer(AsyncWebsocketConsumer):
    # Room-based shared state
    rooms_state = {}

    # Game constants (reintroduced)
    paddle_speed = 30
    paddle_height = 100
    paddle_width = 40
    width = 800
    height = 600
    ball_rad = 10

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.group_name = f'game_{self.room_name}'
        username = self.scope['user'].username

        # Initialize state for the room if it doesn't exist
        if self.room_name not in PongConsumer.rooms_state:
            PongConsumer.rooms_state[self.room_name] = self.initialize_state()

        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

        # Start the game loop for this room if it hasn't started
        if not PongConsumer.rooms_state[self.room_name]["game_started"]:
            PongConsumer.rooms_state[self.room_name]["game_started"] = True
            asyncio.create_task(self.game_loop())
            asyncio.create_task(self.refresh_state())


        # Set player connection state
        if username == PongConsumer.rooms_state[self.room_name]["p1_expected"]:
            PongConsumer.rooms_state[self.room_name]["p1_is_connected"] = True
        elif username == PongConsumer.rooms_state[self.room_name]["p2_expected"]:
            PongConsumer.rooms_state[self.room_name]["p2_is_connected"] = True
        elif PongConsumer.rooms_state[self.room_name]["game_state"] != GameState.MENU:
            print(f"{username} is joining as a spectator", flush=True)
            await self.send_spectator_sync()


    async def disconnect(self, close_code):
        username = self.scope['user'].username

        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        # Safely remove the player from the player list
        if username in PongConsumer.rooms_state[self.room_name]["playerNames"]:
            PongConsumer.rooms_state[self.room_name]["playerNames"].remove(username)

        # Update connection state
        if username == PongConsumer.rooms_state[self.room_name]["p1_expected"]:
            PongConsumer.rooms_state[self.room_name]["p1_is_connected"] = False
            if PongConsumer.rooms_state[self.room_name]["game_state"] != GameState.MENU:
                await self.set_gamestate(GameState.DISCONNECT)
        elif username == PongConsumer.rooms_state[self.room_name]["p2_expected"]:
            PongConsumer.rooms_state[self.room_name]["p2_is_connected"] = False
            if PongConsumer.rooms_state[self.room_name]["game_state"] != GameState.MENU:
                await self.set_gamestate(GameState.DISCONNECT)
        await self.send_state_update()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            event_type = data['type']
            key = data.get('key')

            if event_type == 'authenticate':
                await self.handle_authenticate(data)
            elif event_type == 'keydown':
                await self.handle_keydown(key)
            elif event_type == 'keyup':
                await self.handle_keyup(key)
            elif event_type == 'start_game':
                await self.game_start()
            else:
                print(f"Unknown event type received: {event_type}", flush=True)

        except KeyError as e:
            print(f"KeyError: {e} in data: {data}", flush=True)
        except json.JSONDecodeError:
            print("Failed to decode JSON from WebSocket message", flush=True)

    async def handle_authenticate(self, data):
        token = data.get('token')
        user_info = data.get('user')
        username = user_info['username']
        self.scope['user'].username = username
        PongConsumer.rooms_state[self.room_name]["p1_expected"] = data.get('player1_username', "UNSET")
        PongConsumer.rooms_state[self.room_name]["p2_expected"] = data.get('player2_username', "UNSET")

        #EXPERIMENTAL :
        PongConsumer.rooms_state[self.room_name]["round_index"] = data.get('round_index', "-1")
        PongConsumer.rooms_state[self.room_name]["match_index"] = data.get('match_index', "-1")

        # Set player connection state
        if username == PongConsumer.rooms_state[self.room_name]["p1_expected"]:
            PongConsumer.rooms_state[self.room_name]["p1_is_connected"] = True
        elif username == PongConsumer.rooms_state[self.room_name]["p2_expected"]:
            PongConsumer.rooms_state[self.room_name]["p2_is_connected"] = True

        if username not in PongConsumer.rooms_state[self.room_name]["playerNames"]:
            PongConsumer.rooms_state[self.room_name]["playerNames"].append(username)

        await self.send_state_update()

    async def handle_keydown(self, key):
        username = self.scope['user'].username
        if username == PongConsumer.rooms_state[self.room_name]["p1_expected"]:
            if key == 'w':
                PongConsumer.rooms_state[self.room_name]['red_paddle_up'] = True
            elif key == 's':
                PongConsumer.rooms_state[self.room_name]['red_paddle_down'] = True
        elif username == PongConsumer.rooms_state[self.room_name]["p2_expected"]:
            if key == 'w':
                PongConsumer.rooms_state[self.room_name]['blue_paddle_up'] = True
            elif key == 's':
                PongConsumer.rooms_state[self.room_name]['blue_paddle_down'] = True
        elif key == 'Shift':
            PongConsumer.rooms_state[self.room_name]['shift_key'] = True

    async def handle_keyup(self, key):
        username = self.scope['user'].username
        if username == PongConsumer.rooms_state[self.room_name]["p1_expected"]:
            if key == 'w':
                PongConsumer.rooms_state[self.room_name]['red_paddle_up'] = False
            elif key == 's':
                PongConsumer.rooms_state[self.room_name]['red_paddle_down'] = False
        elif username == PongConsumer.rooms_state[self.room_name]["p2_expected"]:
            if key == 'w':
                PongConsumer.rooms_state[self.room_name]['blue_paddle_up'] = False
            elif key == 's':
                PongConsumer.rooms_state[self.room_name]['blue_paddle_down'] = False
        elif key == 'Shift':
            PongConsumer.rooms_state[self.room_name]['shift_key'] = False

    async def move_paddles(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        if room_state["game_state"] != GameState.IN_PROGRESS:
            return

        speed = self.paddle_speed * 2 if room_state.get('shift_key', False) else self.paddle_speed
        moved = False

        if room_state.get('red_paddle_up', False):
            room_state['red_paddle_top'] -= speed
            moved = True
        if room_state.get('red_paddle_down', False):
            room_state['red_paddle_top'] += speed
            moved = True
        if room_state.get('blue_paddle_up', False):
            room_state['blue_paddle_top'] -= speed
            moved = True
        if room_state.get('blue_paddle_down', False):
            room_state['blue_paddle_top'] += speed
            moved = True

        room_state['red_paddle_top'] = max(0, min(self.height - self.paddle_height, room_state['red_paddle_top']))
        room_state['blue_paddle_top'] = max(0, min(self.height - self.paddle_height, room_state['blue_paddle_top']))

        if moved:
            await self.send_paddle_positions()

    async def game_start(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        room_state["game_state"] = GameState.GAME_START
        room_state["p1Score"] = 0
        room_state["p2Score"] = 0
        room_state["minutes"] = 0
        room_state["seconds"] = 42
        room_state["ball_x"] = self.width / 2
        room_state["ball_y"] = self.height / 2
        room_state["ball_dx"] = 2 * random.randint(5, 8) * random.choice([-1, 1])
        room_state["ball_dy"] = 2 * random.randint(5, 8) * random.choice([-1, 1])
        room_state["red_paddle_top"] = self.height / 2 - (self.paddle_height / 2)
        room_state["blue_paddle_top"] = self.height / 2 - (self.paddle_height / 2)
        await self.send_interval_update()
        await self.broadcast_overlay("!")
        await self.send_roomstate_update("2")



    async def game_loop(self):
        room_state = PongConsumer.rooms_state[self.room_name]

        try:
            while True:
                await asyncio.sleep(1 / 30)
                await self.move_paddles()
                await self.move_ball()
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Exception in game loop: {e}", flush=True)

    async def move_ball(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        if room_state["game_state"] != GameState.IN_PROGRESS:
            return

        room_state["ball_x"] += room_state["ball_dx"]
        room_state["ball_y"] += room_state["ball_dy"]

        if room_state["ball_y"] - self.ball_rad < 0:
            room_state["ball_dy"] = abs(room_state["ball_dy"])
        if room_state["ball_y"] + self.ball_rad > self.height:
            room_state["ball_dy"] = -abs(room_state["ball_dy"])

        if (
            room_state["ball_dx"] < 0 and
            room_state["ball_x"] - self.ball_rad <= 10 + self.paddle_width and
            room_state["red_paddle_top"] < room_state["ball_y"] < room_state["red_paddle_top"] + self.paddle_height
        ):
            room_state["ball_dx"] = abs(room_state["ball_dx"]) * 1.15
            if room_state.get('red_paddle_up', False):
                room_state["ball_dy"] -= 10
            if room_state.get('red_paddle_down', False):
                room_state["ball_dy"] += 10

        if (
            room_state["ball_dx"] > 0 and
            room_state["ball_x"] + self.ball_rad >= 780 - self.paddle_width and
            room_state["blue_paddle_top"] < room_state["ball_y"] < room_state["blue_paddle_top"] + self.paddle_height
        ):
            room_state["ball_dx"] = -abs(room_state["ball_dx"]) * 1.15
            if room_state.get('blue_paddle_up', False):
                room_state["ball_dy"] -= 10
            if room_state.get('blue_paddle_down', False):
                room_state["ball_dy"] += 10

        room_state["ball_dx"] = max(-28, min(28, room_state["ball_dx"]))
        room_state["ball_dy"] = max(-25, min(25, room_state["ball_dy"]))

        if room_state["ball_x"] - self.ball_rad < 0:
            room_state["p2Score"] += 1
            await self.goal_reset()

        if room_state["ball_x"] + self.ball_rad > self.width:
            room_state["p1Score"] += 1
            await self.goal_reset()

        await self.send_game_state()

    async def refresh_state(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        counter = 4
        disc_counter = 10
        sent = False
        while True:
            await asyncio.sleep(1)

            if room_state["game_state"] == GameState.MENU:
                if not sent:
                    sent = True
                    await self.broadcast_overlay("!")
                continue

            if room_state["game_state"] == GameState.DISCONNECT:
                disc_counter -= 1
                await self.broadcast_overlay(f"A fixture player has disconnected! Aborting game in {disc_counter}...")
                if room_state["p1_is_connected"] == True and room_state["p2_is_connected"] == True:
                    await self.set_gamestate(GameState.GAME_START)
                    disc_counter = 10
                if disc_counter == 0:
                    await self.set_gamestate(GameState.MENU)
                    await self.forfeit_game()
                    disc_counter = 10
                continue

            if room_state["game_state"] == GameState.GAME_START:
                sent = False
                counter -= 1
                await self.broadcast_overlay(f"Starting game in {counter}...")
                if counter == 0:
                    await self.set_gamestate(GameState.IN_PROGRESS)
                    counter = 4
                    await self.broadcast_overlay("!")
                continue

            if room_state["game_state"] == GameState.IN_PROGRESS:
                await self.update_timer()
                continue

            if room_state["game_state"] == GameState.GOAL_SCORED:
                if counter > 0:
                    if counter == 4:
                        await self.broadcast_overlay("PING...")
                    if counter < 4:
                        await self.broadcast_overlay("PONG!")
                    counter -= 2
                if counter == 0:
                    await self.broadcast_overlay("!")
                    counter = 4
                    await self.set_gamestate(GameState.IN_PROGRESS)
                continue

            if room_state["game_state"] == GameState.POSTGAME:
                if not sent:
                    sent = True
                    await self.game_over_message()
                counter -= 1
                if counter == 0:
                    await self.broadcast_overlay("MENU")
                    counter = 4
                    sent = False
                    await self.set_gamestate(GameState.MENU)
                continue


    async def goal_reset(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        room_state["ball_x"] = self.width / 2
        room_state["ball_y"] = self.height / 2
        room_state["ball_dx"] = 1.5 * random.randint(5, 7) * random.choice([-1, 1])
        room_state["ball_dy"] = 1.5 * random.randint(5, 7) * random.choice([-1, 1])
        room_state["red_paddle_top"] = self.height / 2 - (self.paddle_height / 2)
        room_state["blue_paddle_top"] = self.height / 2 - (self.paddle_height / 2)
        await self.send_paddle_positions()
        await self.set_gamestate(GameState.GOAL_SCORED)
        if self.p1Score > 10 or self.p2Score > 10 :
            await self.set_gamestate(GameState.POSTGAME)
        else :
            self.ball_x = self.width / 2
            self.ball_y = self.height / 2
            self.ball_dx = 2 * random.randint(5, 7) * random.choice([-1, 1])
            self.ball_dy = 2 * random.randint(5, 7) * random.choice([-1, 1])
            self.paddles['red']['top'] = self.height / 2 - (self.paddle_height / 2)
            self.paddles['blue']['top'] = self.height / 2 - (self.paddle_height / 2)
            self.game_state = GameState.GOAL_SCORED
            await self.send_paddle_positions()

    async def goal_reset(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        if room_state["p1Score"] > 10 or room_state["p2Score"] > 10 :
            await self.set_gamestate(GameState.POSTGAME)
        else :
            room_state["ball_x"] = self.width / 2
            room_state["ball_y"] = self.height / 2
            room_state["ball_dx"] = 2 * random.randint(5, 6) * random.choice([-1, 1])
            room_state["ball_dy"] = 2 * random.randint(5, 6) * random.choice([-1, 1])
            room_state["red_paddle_top"] = self.height / 2 - (self.paddle_height / 2)
            room_state["blue_paddle_top"] = self.height / 2 - (self.paddle_height / 2)
            await self.send_paddle_positions()
            await self.set_gamestate(GameState.GOAL_SCORED)


    async def set_gamestate(self, new_state: GameState):
        room_state = PongConsumer.rooms_state[self.room_name]
        old_state = room_state["game_state"]
        room_state["game_state"] = new_state


    async def send_paddle_positions(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        red_paddle_percentage = (room_state["red_paddle_top"] / self.height) * 100
        blue_paddle_percentage = (room_state["blue_paddle_top"] / self.height) * 100

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'paddle_update',
                'paddles': {
                    'red': {'top': red_paddle_percentage},
                    'blue': {'top': blue_paddle_percentage}
                }
            }
        )

    async def send_ball_position(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        ball_x_percentage = (room_state["ball_x"] / self.width) * 100
        ball_y_percentage = (room_state["ball_y"] / self.height) * 100

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'ball_update',
                'ball': {
                    'x': ball_x_percentage,
                    'y': ball_y_percentage
                }
            }
        )

    async def interval_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'interval_update',
            'player1_score': event['player1_score'],
            'player2_score': event['player2_score'],
            'minutes': event['minutes'],
            'seconds': event['seconds'],
        }))

    async def send_interval_update(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'interval_update',
                'player1_score': room_state["p1Score"],
                'player2_score': room_state["p2Score"],
                'minutes': room_state["minutes"],
                'seconds': room_state["seconds"]
            }
        )

    async def broadcast_overlay(self, custom_message=None):
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'overlay_update',
                'message': custom_message
            }
        )

    async def overlay_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'overlay_update',
            'message': event['message']
        }))

    async def send_state_update(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'state_update',
                'p1_is_connected': room_state["p1_is_connected"],
                'p2_is_connected': room_state["p2_is_connected"],
                'playerNames': room_state["playerNames"]
            }
        )

    async def state_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'state_update',
            'p1_is_connected': event['p1_is_connected'],
            'p2_is_connected': event['p2_is_connected'],
            'playerNames': event['playerNames']
        }))

    async def send_roomstate_update(self, roomState):
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'roomstate_update',
                'roomState': roomState
            }
        )

    async def send_game_state(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        ball_x_percentage = (room_state["ball_x"] / self.width) * 100
        ball_y_percentage = (room_state["ball_y"] / self.height) * 100
        red_paddle_percentage = (room_state["red_paddle_top"] / self.height) * 100
        blue_paddle_percentage = (room_state["blue_paddle_top"] / self.height) * 100

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'game_state_update',
                'ball': {
                    'x': ball_x_percentage,
                    'y': ball_y_percentage
                },
                'paddles': {
                    'red': {'top': red_paddle_percentage},
                    'blue': {'top': blue_paddle_percentage}
                }
            }
        )

    async def roomstate_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'roomstate_update',
            'roomState': event['roomState']
        }))

    async def paddle_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'paddle_update',
            'paddles': event['paddles']
        }))

    async def ball_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'ball_update',
            'ball': event['ball']
        }))

    async def game_state_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state_update',
            'ball': event['ball'],
            'paddles': event['paddles']
        }))

    async def send_game_over_message(self, winner, score1, score2, message):
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'game_over_update',
                'winner': winner,
                'score1': score1,
                'score2': score2,
                'message': message
            }
        )

    async def game_over_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_over_update',
            'winner': event['winner'],
            'score1': event['score1'],
            'score2': event['score2'],
            'message': event['message']
        }))

    async def game_over_message(self, winner="TBD", message="Game Over"):
        room_state = PongConsumer.rooms_state[self.room_name]
        print("Game Over", flush=True)

        if room_state["p1Score"] == room_state["p2Score"]:
            message = "Game Over: DRAW!"
            winner = "TBD"
            score1 = room_state["p1Score"]
            score2 = room_state["p2Score"]
        else:
            winner = room_state["p1_expected"] if room_state["p1Score"] > room_state["p2Score"] else room_state["p2_expected"]
            message = f"Game Over: {winner} wins!"
            score1 = room_state["p1Score"]
            score2 = room_state["p2Score"]

        await self.send_game_over_message(winner, score1, score2, message)


    def initialize_state(self):
        return {
            "ball_x": 50,
            "ball_y": 50,
            "ball_dx": 10,
            "ball_dy": 10,
            "red_paddle_top": 300,
            "blue_paddle_top": 300,
            "p1Score": 0,
            "p2Score": 0,
            "minutes": 0,
            "seconds": 42,
            "game_state": GameState.MENU,
            "game_started": False,
            "p1_is_connected": False,
            "p2_is_connected": False,
            "p1_expected": None,
            "p2_expected": None,
            "round_index": -1,
            "match_index": -1,
            "playerNames": [],
            "red_paddle_up": False,
            "red_paddle_down": False,
            "blue_paddle_up": False,
            "blue_paddle_down": False,
            "shift_key": False,
        }


    async def update_timer(self):
        room_state = PongConsumer.rooms_state[self.room_name]

        if room_state["game_state"] != GameState.IN_PROGRESS:
            return  # Only update the timer if the game is in progress

        if room_state["seconds"] > 0:
            room_state["seconds"] -= 1
        else:
            if room_state["minutes"] > 0:
                room_state["minutes"] -= 1
                room_state["seconds"] = 59
            else:
                # When the timer runs out, transition to POSTGAME state
                await self.set_gamestate(GameState.POSTGAME)
                #await self.game_over_message()

        await self.send_interval_update()  # Broadcast the updated timer to all clients



    async def send_spectator_sync(self):
        room_state = PongConsumer.rooms_state[self.room_name]
        # Send the current room state
        await self.send(text_data=json.dumps({
            'type': 'game_spectator_sync',
            'roomState': room_state["game_state"].name,
        }))

    async def forfeit_game(self):
        room_state = PongConsumer.rooms_state[self.room_name]

        # Determine the winner and loser based on who is still connected
        if room_state["p1_is_connected"]:
            winner = room_state["p1_expected"]
            loser = room_state["p2_expected"]
            room_state["p1Score"] = 10
            room_state["p2Score"] = 0
        elif room_state["p2_is_connected"]:
            winner = room_state["p2_expected"]
            loser = room_state["p1_expected"]
            room_state["p2Score"] = 10
            room_state["p1Score"] = 0
        else:
            # If both players disconnected, it's a draw
            await self.game_over_message("TBD", "Game forfeited! No result!")
            return

        # Announce the result
        message = f"Game forfeited! {winner} wins!"
        print(f"FORFEIT: {message}", flush=True)

        # Transition to POSTGAME state
        await self.set_gamestate(GameState.POSTGAME)

