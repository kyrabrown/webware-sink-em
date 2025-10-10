Final Assignment

===

## CS4241 Final Assignment -- Battleship - Sink 'Em

https://webware-sink-em.onrender.com/

Our group created a battleship game named Sink 'Em. It includes a create/join game feature for two players to play together, a placement phase where players decide where to place their ships on a grid, and a firing phase where players guess where their opponent's ship might be. Our application supports multiple on-going games running in parallel through the use of game codes, and will notify users to reset the game if their opponent disconnects. 

The create game feature creates a game code the join game field accepts, and both pages generate a name for the player which can be modified if desired. When both players click "Ready," the placement stage begins and gives players 5 ships to place anywhere on the board, allowing them to rotate them both horizontally and vertically. The firing stage allows players to select a square to guess (within 30 seconds, otherwise it switches to the opponent's turn), submit when ready, and lets both players know if the guess was a hit or miss. While waiting for your turn, the player can see the hits and misses of their opponent. When a ship has been sunk or when a player has won, the server notifies the users. Everything is brought together with visuals via Tailwind. Please use this application with your browser in "Light Mode."

## Technologies Used:

- **Express + Vite** : We used Express and Vite to build the server to communicate with the client.
- **React** : We used React to build the app, including the client side and display (i.e. buttons, grid, etc).
- **WebSocket** : We used WebSockets (Express-ws/ws) to allow players to play together simultaneously.
- **MongoDB** : We used Mongo to store game data (particularly for game IDs)
- **Tailwind** : We used Tailwind to style our app.

## Challenges faced:

- Our biggest challenge centered around managing work within a group of 5. We found it difficult splitting up work in a way that minimized blockers so that everyone could work simultaneously without waiting for another feature to be finished. We worked to minimize this by assigning tasks related to distinct features within the project (placing stage, firing stage, game management, etc.) and by maintaining constant communication. We also required submitting PRs to push code to main to reduce the chances of breaking functionality or overriding someone's design decisions.
- Learning to work with websockets and maintain a live game state between two distinct players was also a challenge for us to get used to. With traditional software development, APIs are usually used to communicate with the server, however, since we were working with live players who needed different information at a given point in the game, we needed to use websockets to communicate. Working out how to set up a communication protocol was something that we had to look into and tweak as we progressed through development since it was so unfamiliar.
- Managing board states was also difficult because the server needed to maintain two board states and ship values for both players. Additionally, given the nature of the game, the server needed to send both personal and opponent data to each user, meaning that we had to set up good player + game object and data structure design to support these server tasks.

## Group Members and Responsibilities:

- **Andreas Keating** : 
- **Ceci Herriman** : Set up prototype with framework for communication, grid, and game stages. Also worked on server/client communication for directing game state, architecture for managing necessary player/game data, and integrating placing phase with firing phase
- **Christopher Yon** : 
- **Kyra Brown** : 
- **Kelsey Bishqemi** : Create/join game funtion, frontend firing

## Accessibility Features

- CSS used for visual styling
- High contrast colors used against a light background to ensure elements are visible for users with low vision
- Descriptive and clear instructions for users in game
- Contrasting keyboard focus on elements selected via keyboard to clarity for keyboard users
