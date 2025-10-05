/* 
1. Open up a socket server
2. Maintain a list of clients connected to the socket server
3. When a client sends a message to the socket server, forward it to all
connected clients
*/

import express from 'express'
import ViteExpress from 'vite-express'
import expressWs from 'express-ws'
import {MongoClient, ObjectId, ServerApiVersion} from 'mongodb'
import dotenv from 'dotenv'

dotenv.config({quiet: true})
const user = process.env.DB_USER
const pass = process.env.DB_PASSWORD
const url = process.env.DB_URL
const uri = `mongodb+srv://${user}:${pass}@${url}/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
    }
});
const gameData = client.db("webware-sink-em").collection("games")

const app = express()
expressWs(app)
let sockets = {}

class Player {
    constructor(id, ws) {
        this.id = id
        this.displayName = "Guest"
        this.isReady = false
        this.ws = ws
        this.hasPlaced = false
        this.personalBoard = Array.from({length: 10}, () => Array(10).fill(null))
        this.guessesBoard = Array.from({length: 10}, () => Array(10).fill(null))
    }
}

class Game {
    constructor(nextPlayerID, players, isGameWaiting, isPlacingShips, isFiring, isEnd, winner) {
        this.nextPlayerID = nextPlayerID || 0
        this.players = players || {}
        this.isGameWaiting = isGameWaiting || 1
        this.isPlacingShips = isPlacingShips || 0
        this.isFiring = isFiring || 0
        this.isEnd = isEnd || 0
        this.winner = winner || ''
    }

    getOpponent(playerID) {
        if (playerID === 0) {
            return this.players[1]
        } else {
            return this.players[0]
        }
    }

    isAWinner(playerID, opponentID) {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {

                // if opponent has a ship, but player's guessesBoard does not have a hit here
                if (this.players[opponentID].personalBoard[i][j] === 'S' && this.players[playerID].guessesBoard[i][j] !== 'H') {
                    return false;
                }

            }
        }
        return true; // all hits match with ships
    }

    handleReady(playerID) {
        this.players[playerID].isReady = true

        //check if both are ready, if so, begin!
        if (Object.keys(this.players).length === 2 && this.players[0].isReady && this.players[1].isReady) {
            this.isGameWaiting = 0
            this.isPlacingShips = 1
        }
    }

    handlePlacement(playerID, placements) {
        //update player's placement board
        this.players[playerID].personalBoard = placements
        this.players[playerID].hasPlaced = true

        //check if both are in, if so, begin firing stage!
        if (Object.keys(this.players).length === 2 && this.players[0].hasPlaced && this.players[1].hasPlaced) {
            this.isPlacingShips = 0
            this.isFiring = 1
        }
    }

    handleFiringGuess(playerID, x, y) {
        //determine if player's guess was a hit or miss and update guess board
        let opponent = this.getOpponent(playerID)

        if (opponent.personalBoard[x][y] === 'S') {
            //guess was a hit
            this.players[playerID].guessesBoard[x][y] = 'H'
        } else {
            //guess was a miss
            this.players[playerID].guessesBoard[x][y] = 'M'
        }

        //check if the player has won
        if (this.isAWinner(playerID, opponent.id)) {
            //if a winner, change game flags
            this.isFiring = 0
            this.isEnd = 1
            this.winner = playerID //change to display name later
        }
    }
}

let game = new Game()

app.get('/create', async (req, res) => {
    let game = new Game()
    const insertedGame = await gameData.insertOne(game)
    res.send(insertedGame.insertedId)
})

app.ws('/ws', async (client, req) => {
    const objectID = new ObjectId(req.query.id)
    const retrieveGame = async () => {
        const retrievedGame = await gameData.findOne({
            _id: objectID
        })
        game = new Game(
            retrievedGame.nextPlayerID,
            retrievedGame.players,
            retrievedGame.isGameWaiting,
            retrievedGame.isPlacingShips,
            retrievedGame.isFiring,
            retrievedGame.isEnd,
            retrievedGame.winner
        )
    }
    await retrieveGame()

    const updateGameInMongo = async () => {
        await gameData.replaceOne({_id: objectID}, game)
    }
    const resetGame = async () => {
        game = new Game()
        await gameData.replaceOne({_id: objectID}, game)
    }
    console.log('connect!', Object.keys(game.players).length)
    const isFull = Object.keys(game.players).length > 1
    if (!isFull) {
        const socketID = crypto.randomUUID()
        sockets[socketID] = client
        console.log("socket id:" + socketID)
        //log new player
        let newPlayer = new Player(game.nextPlayerID, socketID);
        game.players[game.nextPlayerID] = newPlayer
        client.playerID = newPlayer.id
        game.nextPlayerID++
        await updateGameInMongo()
        client.send(JSON.stringify({type: 'Waiting', payload: {Waiting: true}}));
    } else {
        client.send(JSON.stringify({type: 'Full', payload: {Full: true}}));
    }


    // when the server receives a new message from this client...
    client.on('message', async msgSent => {
        if (client.hasOwnProperty("playerID")) {
            await retrieveGame()
            let msg;
            try {
                msg = JSON.parse(msgSent);
            } catch (e) {
                client.send(JSON.stringify({type: 'error', payload: {message: 'bad json'}}));
                return;
            }
            const {type, payload} = msg;
            let opponent = game.getOpponent(client.playerID)

            //parse based on message type and handle from there
            if (type === "Ready") {
                game.handleReady(client.playerID)

                //send signal to begin placing ships if both ready
                if (!game.isGameWaiting && game.isPlacingShips) {
                    client.send(JSON.stringify({type: 'StartPlacing', payload: {StartPlacing: true}}));
                    try {
                        sockets[opponent.ws].send(JSON.stringify({
                            type: 'StartPlacing',
                            payload: {StartPlacing: true}
                        }));
                    } catch (e) {
                        console.error("Client disconnected during a game")
                        await resetGame()
                    }
                }

                //else, send signal to continue waiting
                else {
                    client.send(JSON.stringify({type: 'Waiting', payload: {Waiting: true}}));

                    if (opponent) {
                        try {
                            sockets[opponent.ws].send(JSON.stringify({type: 'Waiting', payload: {Waiting: true}}));
                        } catch (e) {
                            console.error("Client disconnected during a game")
                            await resetGame()
                        }
                    }
                }
            } else if (type === "Placed") {
                game.handlePlacement(client.playerID, payload.Placements)
                //send signal to begin the firing stage if both players have their placements in
                if (!game.isPlacingShips && game.isFiring) {
                    await updateGameInMongo()
                    client.send(JSON.stringify({type: 'Firing', payload: {YourTurn: true}}));
                    try {
                        sockets[opponent.ws].send(JSON.stringify({type: 'Firing', payload: {YourTurn: false}}));
                    } catch (e) {
                        console.error("Client disconnected during a game")
                        await resetGame()
                    }

                }
            } else if (type === "FiringGuess") {
                try {
                    game.handleFiringGuess(client.playerID, payload.GuessX, payload.GuessY)
                    await updateGameInMongo()
                } catch (e) {
                    console.log("Client disconnected during a game")
                    await resetGame()
                }


                //if game is not over, send signal to users to give next guess
                if (game.isFiring && !game.isEnd) {
                    client.send(JSON.stringify({type: 'Firing', payload: {YourTurn: false}}));
                    try {
                        sockets[opponent.ws].send(JSON.stringify({type: 'Firing', payload: {YourTurn: true}}));
                    } catch (e) {
                        console.error("Client disconnected during a game")
                        await resetGame()
                    }

                }

                //if game is over, send signal to users
                else if (game.isEnd) {
                    client.send(JSON.stringify({type: 'End', payload: {Winner: game.winner}}));
                    try {
                        sockets[opponent.ws].send(JSON.stringify({type: 'End', payload: {Winner: game.winner}}));
                    } catch (e) {
                        console.error("Client disconnected during a game")
                        await resetGame()
                    }

                }
            }
            await updateGameInMongo()
        }
    })

    //on a disconnect....
    client.on("close", async () => {
        await retrieveGame()
        if (client.hasOwnProperty("playerID")) {
            console.log("Player disconnected:", client.playerID);
            const opponent = game.getOpponent(client.playerID)
            const player = game.players[client.playerID]
            if (player){
                delete sockets[game.players[client.playerID].ws]
            }
            if (opponent && sockets[opponent.ws]) {
                sockets[opponent.ws].send(JSON.stringify({type: 'Disconnected', payload: {Disconnected: true}}))
                sockets[opponent.ws].close()
                delete sockets[opponent.ws]
            }
            await resetGame()
        }
    });

})


ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));
