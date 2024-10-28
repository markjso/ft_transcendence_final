# ft_transcendence
## Overview
ft_transcendence is the final project of the 42 Common Core program, developed by our team. It is a single-page web application featuring an online real-time Pong game, tournaments, chat functionality, user account management, and player statistics. The project utilizes Django for the backend, Postgresql for the database and the Bootstrap library with React for the frontend.

## Project Team
* Jo Marks (https://github.com/markjso)
* Jaejun Shin (https://github.com/jaejunshin96)
* Mehdi Mirzaie (https://github.com/MehdiMirzaie2)
* Isaac Vanderwal (https://github.com/vanderhammer91)
* Louis Xu (https://github.com/louissxu)

## Features
### 1. Pong Game
Players can engage in a responsive, real-time Pong game. The game uses server-client communication for real-time interactivity.

### 2. Tournament System
A tournament mode where multiple users (2, 4, 8, or 16) can join and are then matched, adding a competitive aspect to the game. The tournament system announces which users are expected for the next game.

### 3. Live Chat Feature
A live chat system is integrated to allow players to communicate with each other via group chats and direct messages. Users have the ability to block other users, access player profiles and  invite other users to a game.

### 4. User Management
User Creation & Authentication: Players can register for an account using 2FA or use their 42 log in. Authentication is handled securely through Django’s built-in user management. Each player has a dedicated profile page displaying information (including username and avatar), statistics, and match history. Users have the ability to change their personal details.

### 5. Blockchain storage
Tournament scores are stored securely on a blockchain via Solidity Smart Contracts.

## Technologies Used
* Backend: ![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
* Frontend: ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
* Database: ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
* Deployment: ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
* Real-time Communication: Django Channels and WebSockets for real-time gameplay and chat
