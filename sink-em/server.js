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
      clients = []

let grid = Array.from({ length: 10 }, () => Array(10).fill(null))

socketServer.on( 'connection', client => {
  console.log( 'connect!' )
    
  // when the server receives a message from this client...
  client.on( 'message', msg => {

	// send msg to every client EXCEPT the one who originally sent it

    const text = msg.toString(); 

    //update grid
    const [x, y] = JSON.parse(msg.toString());
    grid[x][y] = 'X'

    //send grid
    clients.forEach((c) => {
        if (c !== client && c.readyState === 1) {
            c.send(JSON.stringify(grid));
        }
    });
  })

  // add client to client list
  clients.push( client )
})

app.get('/api/board', async (req, res) => {
  //send board
  res.json(grid)
})

server.listen( 3000 )

ViteExpress.bind( app, server )