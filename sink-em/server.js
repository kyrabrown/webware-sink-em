/* 
1. Open up a socket server
2. Maintain a list of clients connected to the socket server
3. When a client sends a message to the socket server, forward it to all
connected clients
*/

import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import { WebSocketServer } from 'ws'

const app = express()

const server = http.createServer( app ),
      socketServer = new WebSocketServer({ server }),
      clients = [] //for now, assume only 2 clients 

class Player {
  constructor(id, ws) {
    this.id = id
    this.isReady = false
    this.ws = ws
    this.hasPlaced = false
    this.personalBoard = Array.from({ length: 10 }, () => Array(10).fill(null))
    this.guessesBoard = Array.from({ length: 10 }, () => Array(10).fill(null))
  }

  handleMessage(msg) {
    // const text = msg.toString(); 

    // //update grid
    // const [x, y] = JSON.parse(msg.toString());
    // grid[x][y] = 'X'

    // //send grid
    // clients.forEach((c) => {
    //     if (c !== client && c.readyState === 1) {
    //         c.send(JSON.stringify(grid));
    //     }
    // });
  }

}

class Game {
  constructor() {
    this.nextPlayerID = 0 
    this.players = []
    this.isGameWaiting = 1
    this.isPlacingShips = 0 
    this.isFiring = 0 
  }

  getOpponent(player) {
    if(player.id == 0) {
      return this.players[1]
    }
    else {
      return this.players[0]
    }
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
}

let game = new Game()

socketServer.on( 'connection', client => {
  console.log( 'connect!', game.players.length )
    
  //log new player
  let newPlayer = new Player(game.nextPlayerID, client); 
  game.players[game.nextPlayerID] = newPlayer
  client.player = newPlayer
  game.nextPlayerID++ 
  client.send(JSON.stringify({ type:'Waiting', payload: { Waiting: true }}));

  // when the server receives a new message from this client...
  client.on( 'message', msgSent => {
    let msg;
    try { 
      msg = JSON.parse(msgSent); 
    } 
    catch(e) { 
      client.send(JSON.stringify({ type:'error', payload: { message:'bad json' }})); 
      return; 
    }
    const { type, payload } = msg;
    let opponent = game.getOpponent(client.player)

    //parse based on message type and handle from there
    if(type === "Ready") {
      game.handleReady(client.player)

      //send signal to begin placing ships if both ready
      if(!game.isGameWaiting && game.isPlacingShips) {
        client.send(JSON.stringify({ type:'StartPlacing', payload: { StartPlacing: true }}));
        opponent.ws.send(JSON.stringify({ type:'StartPlacing', payload: { StartPlacing: true }}));
      }

      //else, send signal to continue waiting
      else {
        client.send(JSON.stringify({ type:'Waiting', payload: { Waiting: true }}));
        
        if (opponent) {
          opponent.ws.send(JSON.stringify({ type:'Waiting', payload: { Waiting: true }}));
        }
      }
    }
    else if (type === "Placed") {
      game.handlePlacement(client.player, payload)

      //send signal to begin the firing stage if both players have their placements in
      if(!game.isPlacingShips && game.isFiring) {
        client.send(JSON.stringify({ type:'Firing', payload: { YourTurn: true }}));
        opponent.ws.send(JSON.stringify({ type:'Firing', payload: { YourTurn: false }}));
      }
    }

  })

  //on a disconnect....
  client.on("close", () => {
    console.log("Player disconnected:", client.player.id);
    delete game.players[client.player.id];

  });
})

server.listen( 3000 )

ViteExpress.bind( app, server )