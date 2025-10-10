Final Assignment

===

## CS4241 Final Assignment -- Battleship - Sink 'Em

https://webware-sink-em.onrender.com/

Our group created a battleship game named Sink 'Em. It includes a create/join game feature for two players to play together, a placement phase where players decide where to place their ships on a grid, and a firing phase where players guess where their opponent's ship might be. Our application supports multiple on-going games running in parallel through the use of game codes, and will notify users to reset the game if their opponent disconnects. 

The create game feature creates a game code the join game field accepts, and both pages generate a name for the player which can be modified if desired. When both players click "Ready," the placement stage begins and gives players 5 ships to place anywhere on the board, allowing them to rotate them both horizontally and vertically. You can place ships on the board with your mouse and rotate by pressing the 'R" key. To select a ship to place, you can click the respective keys 1, 2, 3, 4, 5. The firing stage allows players to select a square to guess (within 30 seconds, otherwise it switches to the opponent's turn) by clicking a square and then clicking submit when ready. The game will then display to both players if the guess was a hit or miss and update their boards to show the new state. While waiting for your turn, the player can see the hits and misses of their opponent. When a ship has been sunk or when a player has won, the server also notifies the users. Everything is brought together with visuals via Tailwind. Please use this application with your browser in full screen.  Can be used in dark or light mode.

## Technologies Used:

- **Express + Vite** : We used Express and Vite to build the server to communicate with the client.
- **React** : We used React to build the app, including the client side and display (i.e. buttons, grid, etc).
- **WebSocket** : We used WebSockets (express-ws) to maintain separate communication with varying amounts of players to allow users to play together simultaneously. This was the most challenging technology for us to use since it was new to all of us.
- **MongoDB** : We used Mongo to store game data, and used the IDs to reference them across clients
- **Tailwind** : We used Tailwind to style our app.

## Challenges faced:

- Our biggest challenge centered around managing work within a group of 5. We found it difficult splitting up work in a way that minimized blockers so that everyone could work simultaneously without waiting for another feature to be finished. We worked to minimize this by assigning tasks related to distinct features within the project (placing stage, firing stage, game management, etc.) and by maintaining constant communication. We also required submitting PRs to push code to main to reduce the chances of breaking functionality or overriding someone's design decisions.
- Learning to work with websockets and maintain a live game state between two distinct players was also a challenge for us to get used to. With traditional software development, APIs are usually used to communicate with the server, however, since we were working with live players who needed different information at a given point in the game, we needed to use websockets to communicate. Working out how to set up a communication protocol was something that we had to look into and tweak as we progressed through development since it was so unfamiliar.
- Managing board states was also difficult because the server needed to maintain two board states and ship values for both players. Additionally, given the nature of the game, the server needed to send both personal and opponent data to each user, meaning that we had to set up good player + game object and data structure design to support these server tasks. Similarly, detecting when a ship was sunk was difficult as it required referencing both a guesses board and ship values for a player to see if all cells for a given ship mapped to hits on a player's guess board. 
- Implementing frontend design for logic extending across the project was also difficult. The game displays boards throughout the game, however, each require slightly different functionality and design depending on their purpose (placing grid vs. fleet grid vs. firing grid). We had to figure out how to integrate these small varying design aspects into a single Grid component. Similarly to above, updating design functionality to accommodate someone else's new component changes also took a lot of debugging time. Grid frontend logic also depends on how data is manipulated and sent from the server, which was another hurdle that we had to account for by "cleaning" the data the frontend received to prepare it for display on the grid. 
- Implementing the battleship placement was also difficult. We had to figure out how to make each ship get stored as an object while having them also store their own coordinates, while also updating the shared 10×10 grid without breaking React’s reactivity was challenging. Allowing players to remove in order to reposition any placed ship required tracking and clearing exact coordinates from both the board and the ship’s own cells array without interfering with other ships. Creating a “hover silhouette” that dynamically highlighted all squares a ship would occupy was tricky. It had to update every time the mouse moved and everytime the ship was rotated, while maintaining smooth visual feedback along with error messages that came up when trying to do an invalid placement (sush as ship overlapping and out of bounds placement).
- Storing the games in the database as opposed to in-memory raised several challenges, including retrieving the most up-to-date copy of the game at the beginning of each client request and explicitly saving it to the database after every modification.

## Group Members and Responsibilities:

- **Andreas Keating** : Implemented battleship placement phase, which includes: placing ships on the grid, removing any placed ship of your choosing from the grid, a ship selector/inventory system, error checks that prevent overlapping ship placement and off grid ship placement, a feature that adds a "ship hovering silhouette" to allow the user to preview where the ship would be placed.
- **Ceci Herriman** : Set up prototype with framework for communication, grid, and game stages. Further helped work on server/client communication for directing game state, architecture for managing necessary player/game data, and integrating placing phase with firing phase. Responsible for reviewing PRs.
- **Christopher Yon** : Adapted initial WebSocket implementation to use express-ws, allowing both web requests and WebSocket requests to be handled by the single backend server. Implemented storing games in MongoDB, and having multiple games running at once on the same server. Adapted create/join game functionality to use MongoDB object IDs as codes. Made initial server implementation much more resilient to edge cases, such as a player disconnecting during the middle of a game. Implemented display name functionality, prefilled with a random adjective + animal.  
- **Kyra Brown** : Installed and implemented Tailwind for project.  Set up index.css file to have different classes to use.  Integrated frontend with user logic and functionality.  Created components like header, board axis, hit and miss icons, updating user statements and data to be visible.  Helped with debugging.
- **Kelsey Bishqemi** : Create/join game function, frontend firing

## Accessibility Features

- CSS used for visual styling
- High contrast colors used against a light background to ensure elements are visible for users with low vision (contrast maintained for both dark and light mode)
- Descriptive and clear instructions for users in game
- Contrasting keyboard focus on elements selected via keyboard to provide clarity for keyboard users
