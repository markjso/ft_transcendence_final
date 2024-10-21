import random
import time
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

class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.paddles = {
            'red': {'left': 10, 'top': 300, 'keyisdown_up': False, 'keyisdown_down': False},
            'blue': {'left': 780, 'top': 300, 'keyisdown_up': False, 'keyisdown_down': False}
        }
        self.paddle_speed = 20
        self.paddle_height = 100
        self.paddle_width = 40
        self.keyisdown_shift = False

        # Consts/Permanent states
        self.width = 800
        self.height = 600
        self.last_print_time = time.time()
        self.game_state = GameState.MENU

        # Paddle init
        self.leftPaddle_x = 10
        self.rightPaddle_x = 780

        # Ball info
        self.ball_x = 50
        self.ball_y = 50
        self.ball_dx = 10
        self.ball_dy = 10
        self.ball_rad = 10

        # Score info
        self.p1Score = 0
        self.p2Score = 0

        # Timer
        self.minutes = -1
        self.seconds = -1

        # Start the once per second update method
        asyncio.create_task(self.interval_refresh())

    async def game_start(self):
        self.p1Score = 0
        self.p2Score = 0
        self.minutes = 1
        self.seconds = 20
        self.ball_x = self.width / 2
        self.ball_y = self.height / 2
        self.ball_dx = 2 * random.randint(5, 7) * random.choice([-1, 1])
        self.ball_dy = 2 * random.randint(5, 7) * random.choice([-1, 1])
        self.paddles['red']['top'] = self.height / 2 - (self.paddle_height / 2)
        self.paddles['blue']['top'] = self.height / 2 - (self.paddle_height / 2)
        await self.send_interval_update()

    async def game_over_message(self):
        if self.p1Score == self.p2Score:
            message = "Game Over:\n DRAW!"
        else:
            winner = "RED" if self.p1Score > self.p2Score else "BLUE"
            message = f"Game Over:\n {winner} wins!"
        await self.broadcast_overlay(custom_message=message)

    async def set_gamestate(self, new_state):
        self.game_state = new_state

    async def interval_refresh(self):
        counter = 4
        sent = False
        while True:
            await asyncio.sleep(1)

            if self.game_state == GameState.MENU:
                if not sent:
                    sent = True
                    await self.broadcast_overlay(custom_message="!")
                continue

            if self.game_state == GameState.GAME_START:
                sent = False
                await self.game_start()
                counter -= 1
                await self.broadcast_overlay(custom_message=f"Starting game in {counter}...")
                if counter == 0:
                    await self.set_gamestate(GameState.IN_PROGRESS)
                    counter = 4
                    await self.broadcast_overlay(custom_message="!")
                continue

            if self.game_state == GameState.IN_PROGRESS:
                if self.seconds > 0:
                    self.seconds -= 1
                else:
                    if self.minutes > 0:
                        self.minutes -= 1
                        self.seconds = 59
                    else:
                        await self.set_gamestate(GameState.POSTGAME)
                await self.send_interval_update()
                continue

            if self.game_state == GameState.GOAL_SCORED :
                if (counter > 0) :
                    if counter == 4 :
                        await self.broadcast_overlay(custom_message=f"PING...")
                    if counter < 4 :
                        await self.broadcast_overlay(custom_message=f"PONG!")
                    counter -= 2
                if counter == 0 :
                    await self.broadcast_overlay(custom_message="!")
                    counter = 4
                    await self.set_gamestate(GameState.IN_PROGRESS)
                continue


            if self.game_state == GameState.POSTGAME:
                if not sent:
                    sent = True
                    await self.game_over_message()
                counter -= 1
                if counter == 0:
                    await self.broadcast_overlay(custom_message="MENU")
                    counter = 4
                    sent = False
                    await self.set_gamestate(GameState.MENU)
                continue

    async def goal_reset(self):
        if self.p1Score > 10 or self.p2Score > 10 :
            await self.set_gamestate(GameState.POSTGAME)
        else :
            self.ball_x = self.width / 2
            self.ball_y = self.height / 2
            self.ball_dx = 2 * random.randint(5, 6) * random.choice([-1, 1])
            self.ball_dy = 2 * random.randint(5, 6) * random.choice([-1, 1])
            self.paddles['red']['top'] = self.height / 2 - (self.paddle_height / 2)
            self.paddles['blue']['top'] = self.height / 2 - (self.paddle_height / 2)
            self.game_state = GameState.GOAL_SCORED
            await self.send_paddle_positions()


    async def connect(self):
        self.user = self.scope['url_route']['kwargs']['user']
        await self.accept()
        self.move_task = asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        self.move_task.cancel()

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data['type']
        key = data.get('key')
        if event_type == 'keydown':
            await self.handle_keydown(key)
        elif event_type == 'keyup':
            await self.handle_keyup(key)
        elif event_type == 'start_game':
            await self.set_gamestate(GameState.GAME_START)

    async def handle_keydown(self, key):
        if key == 'w':
            self.paddles['red']['keyisdown_up'] = True
        elif key == 's':
            self.paddles['red']['keyisdown_down'] = True
        elif key == 'o':
            self.paddles['blue']['keyisdown_up'] = True
        elif key == 'l':
            self.paddles['blue']['keyisdown_down'] = True
        elif key == 'Shift':
            self.keyisdown_shift = True

    async def handle_keyup(self, key):
        if key == 'w':
            self.paddles['red']['keyisdown_up'] = False
        elif key == 's':
            self.paddles['red']['keyisdown_down'] = False
        elif key == 'o':
            self.paddles['blue']['keyisdown_up'] = False
        elif key == 'l':
            self.paddles['blue']['keyisdown_down'] = False
        elif key == 'Shift':
            self.keyisdown_shift = False

    async def move_ball(self):
        if self.game_state != GameState.IN_PROGRESS:
            return

        self.ball_x += self.ball_dx
        self.ball_y += self.ball_dy

        # Ball collision with top and bottom walls
        if self.ball_y - self.ball_rad < 0:
            self.ball_dy = abs(self.ball_dy)
        if self.ball_y + self.ball_rad > self.height:
            self.ball_dy = -abs(self.ball_dy)

        # Ball collision with left paddle
        if (self.ball_dx < 0) and (self.ball_x - self.ball_rad <= self.paddles['red']['left'] + self.paddle_width) and (
            self.paddles['red']['top'] < self.ball_y < self.paddles['red']['top'] + self.paddle_height):
            self.ball_dx = abs(self.ball_dx) * 1.5

            if self.paddles['red']['keyisdown_up']:
                self.ball_dy -= 10
            if self.paddles['red']['keyisdown_down']:
                self.ball_dy += 10

        # Ball collision with right paddle
        if (self.ball_dx > 0) and (self.ball_x + self.ball_rad >= self.paddles['blue']['left'] - self.paddle_width) and (
            self.paddles['blue']['top'] < self.ball_y < self.paddles['blue']['top'] + self.paddle_height):
            self.ball_dx = -abs(self.ball_dx) * 1.15

            if self.paddles['blue']['keyisdown_up']:
                self.ball_dy -= 10
            if self.paddles['blue']['keyisdown_down']:
                self.ball_dy += 10


        #Clamping the balls velocity vectors.
        self.ball_dx = max(-28, min(28, self.ball_dx))
        self.ball_dy = max(-25, min(25, self.ball_dy))



        # Ball out of bounds (scoring logic)
        if self.ball_x - self.ball_rad < 0:
            self.p2Score += 1
            await self.goal_reset()

        if self.ball_x + self.ball_rad > self.width:
            self.p1Score += 1
            await self.goal_reset()

        await self.send_ball_position()

    async def move_paddles(self):
        if self.game_state != GameState.IN_PROGRESS:
            return

        speed = self.paddle_speed * 2 if self.keyisdown_shift else self.paddle_speed
        moved = False

        if self.paddles['red']['keyisdown_up']:
            self.paddles['red']['top'] -= speed
            moved = True
        if self.paddles['red']['keyisdown_down']:
            self.paddles['red']['top'] += speed
            moved = True
        if self.paddles['blue']['keyisdown_up']:
            self.paddles['blue']['top'] -= speed
            moved = True
        if self.paddles['blue']['keyisdown_down']:
            self.paddles['blue']['top'] += speed
            moved = True

        self.paddles['red']['top'] = max(0, min(self.height - self.paddle_height - 20, self.paddles['red']['top']))
        self.paddles['blue']['top'] = max(0, min(self.height - self.paddle_height - 20, self.paddles['blue']['top']))

        if moved:
            await self.send_paddle_positions()

    async def game_loop(self):
        try:
            while True:
                await asyncio.sleep(1 / 30)
                await self.move_paddles()
                await self.move_ball()
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Exception in game loop: {e}", flush=True)

    async def send_paddle_positions(self):
        red_paddle_percentage = (self.paddles['red']['top'] / self.height) * 100
        blue_paddle_percentage = (self.paddles['blue']['top'] / self.height) * 100

        await self.send(text_data=json.dumps({
            'type': 'paddle_update',
            'paddles': {
                'red': {'top': red_paddle_percentage},
                'blue': {'top': blue_paddle_percentage}
            }
        }))

    async def send_ball_position(self):
        ball_x_percentage = (self.ball_x / self.width) * 100
        ball_y_percentage = (self.ball_y / self.height) * 100

        await self.send(text_data=json.dumps({
            'type': 'ball_update',
            'ball': {
                'x': ball_x_percentage,
                'y': ball_y_percentage
            }
        }))

    async def broadcast_overlay(self, custom_message=None):
        overlay_message = custom_message
        state_message = json.dumps({
            'type': 'overlay_update',
            'message': overlay_message
        })
        await self.send(state_message)

    async def send_interval_update(self):
        await self.send(text_data=json.dumps({
            'type': 'interval_update',
            'player1_score': self.p1Score,
            'player2_score': self.p2Score,
            'minutes': self.minutes,
            'seconds': self.seconds
        }))
