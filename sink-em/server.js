/* 
1. Open up a socket server
2. Maintain a list of clients connected to the socket server
3. When a client sends a message to the socket server, forward it to all
connected clients
*/

import express from 'express'
import ViteExpress from 'vite-express'
import expressWs from 'express-ws'


const app = express()
expressWs(app)
const clients = [] //for now, assume only 2 clients

class Player {
  constructor(id, ws) {
    this.id = id
    this.displayName = "Guest"
    this.isReady = false
    this.ws = ws
    this.hasPlaced = false
    this.personalBoard = Array.from({ length: 10 }, () => Array(10).fill(null))
    this.guessesBoard = Array.from({ length: 10 }, () => Array(10).fill(null))
  }
}

class Game {
  constructor() {
    this.nextPlayerID = 0 
    this.players = []
    this.isGameWaiting = 1
    this.isPlacingShips = 0 
    this.isFiring = 0 
    this.isEnd = 0
    this.winner = ''
  }

  getOpponent(player) {
    if(player.id == 0) {
      return this.players[1]
    }
    else {
      return this.players[0]
    }
  }

  isAWinner(player, opponent) {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {

        // if opponent has a ship, but player's guessesBoard does not have a hit here
        if (opponent.personalBoard[i][j] === 'S' && player.guessesBoard[i][j] !== 'H') {
          return false; 
        }

      }
    }
  return true; // all hits match with ships
  }

  handleReady(player) {
    player.isReady = true

    //check if both are ready, if so, begin!
    if(this.players.length == 2 && this.players[0].isReady && this.players[1].isReady ) {
      this.isGameWaiting = 0
      this.isPlacingShips = 1
    }
  }

  handlePlacement(player, placements) {
    //update player's placement board 
    player.personalBoard = placements
    player.hasPlaced = true

    //check if both are in, if so, begin firing stage!
    if(this.players.length == 2 && this.players[0].hasPlaced && this.players[1].hasPlaced ) {
      this.isPlacingShips = 0
      this.isFiring = 1
    }
  }

  handleFiringGuess(player, x, y) {
    //determine if player's guess was a hit or miss and update guess board
    let opponent = this.getOpponent(player)

    if(opponent.personalBoard[x][y] === 'S') {
      //guess was a hit
      player.guessesBoard[x][y] === 'H'
    }
    else {
      //guess was a miss
      player.guessesBoard[x][y] === 'M'
    }

    //check if the player has won
    if(this.isAWinner(player, opponent)) {
      //if a winner, change game flags
      this.isFiring = 0 
      this.isEnd = 1
      this.winner = player.id //change to display name later
    }
  }
}

let game = new Game()
app.ws('/ws', (client, req) => {

    console.log('connect!', game.players.length)

    //log new player
    let newPlayer = new Player(game.nextPlayerID, client);
    game.players[game.nextPlayerID] = newPlayer
    client.player = newPlayer
    game.nextPlayerID++
    client.send(JSON.stringify({type: 'Waiting', payload: {Waiting: true}}));

    // when the server receives a new message from this client...
    client.on('message', msgSent => {
        let msg;
        try {
            msg = JSON.parse(msgSent);
        } catch (e) {
            client.send(JSON.stringify({type: 'error', payload: {message: 'bad json'}}));
            return;
        }
        const {type, payload} = msg;
        let opponent = game.getOpponent(client.player)

        //parse based on message type and handle from there
        if (type === "Ready") {
            game.handleReady(client.player)

            //send signal to begin placing ships if both ready
            if (!game.isGameWaiting && game.isPlacingShips) {
                client.send(JSON.stringify({type: 'StartPlacing', payload: {StartPlacing: true}}));
                opponent.ws.send(JSON.stringify({type: 'StartPlacing', payload: {StartPlacing: true}}));
            }

            //else, send signal to continue waiting
            else {
                client.send(JSON.stringify({type: 'Waiting', payload: {Waiting: true}}));

                if (opponent) {
                    opponent.ws.send(JSON.stringify({type: 'Waiting', payload: {Waiting: true}}));
                }
            }
        } else if (type === "Placed") {
          game.handlePlacement(client.player, payload.Placements)

          //send signal to begin the firing stage if both players have their placements in
          if (!game.isPlacingShips && game.isFiring) {
              client.send(JSON.stringify({type: 'Firing', payload: {YourTurn: true}}));
              opponent.ws.send(JSON.stringify({type: 'Firing', payload: {YourTurn: false}}));
          }
        } else if (type === "FiringGuess") {
          game.handleFiringGuess(client.player, payload.GuessX, payload.GuessY)

          //if game is not over, send signal to users to give next guess
          if(game.isFiring && !game.isEnd) {
            client.send(JSON.stringify({type: 'Firing', payload: {YourTurn: false}}));
            opponent.ws.send(JSON.stringify({type: 'Firing', payload: {YourTurn: true}}));
          }

          //if game is over, send signal to users
          else if(game.isEnd) {
            client.send(JSON.stringify({type: 'End', payload: {Winner: game.winner}}));
            opponent.ws.send(JSON.stringify({type: 'End', payload: {Winner: game.winner}}));
          }
        }

    })

    //on a disconnect....
    client.on("close", () => {
        console.log("Player disconnected:", client.player.id);
        delete game.players[client.player.id];

    });

})


ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));
