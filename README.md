<h1>ft_transcendence</h1>
<h2>Overview</h2>
ft_transcendence is the final project of the 42 Common Core program, developed by our team. It is a single-page web application featuring an online real-time Pong game, tournaments, chat functionality, user account management, and player statistics. The project utilizes Django for the backend, Postgresql for the database and the Bootstrap library with React for the frontend.

<h2>Features</h2>
<h3>1. Pong Game</h3>
Players can engage in a responsive, real-time Pong game. The game uses server-client communication for real-time interactivity.

<h3>2. Tournament System</h3>
A tournament mode where multiple users (2,4,8, or 16) can join and are then matched, adding a competitive aspect to the game. The tournament system announces which users are expected for the next game.

<h3>3. Live Chat Feature</h3>
A live chat system is integrated to allow players to communicate with each other via group chats and direct messages. Users have the ability to block other users, access player profiles and  invite other users to a game.

<h3>4. User Management</h3>
User Creation & Authentication: Players can register for an account using 2FA or use their 42 log in. Authentication is handled securely through Django’s built-in user management. Each player has a dedicated profile page displaying information (including username and avatar), statistics, and match history. Users have the ability to change their personal details.

<h3>5. Blockchain storage</h3>
Tournament scores are stored securely on a blockchain via Solidity Smart Contracts.

<h2>Technologies Used</h2>
Backend: Django (Python)
Frontend: React/Bootstrap
Database: PostgreSQL
Real-time Communication: Django Channels and WebSockets for real-time gameplay and chat
Deployment: Docker Compose
