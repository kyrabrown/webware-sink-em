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
const port = 3000
const user = process.env.DB_USER
const pass = process.env.DB_PASSWORD
const url = process.env.DB_URL
if (!user || !pass || !url) {
    console.log("Environment variables not set up correctly. Please place .env file with\n" +
        "credentials inside sink-em folder or paste contents into Render environment\n" +
        "variables if deploying (download link is in Slack).")
    process.exit(1)
}
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
        this.displayName = "Player " + id
        this.isReady = false
        this.ws = ws
        this.hasPlaced = false
        this.personalBoard = Array.from({length: 10}, () => Array(10).fill(null))
        this.guessesBoard = Array.from({length: 10}, () => Array(10).fill(null))
        this.ships = [
            { id: "A", name: "Aircraft Carrier", size: 5, placed: false, cells: [], sunk: false },
            { id: "B", name: "Battleship", size: 4, placed: false, cells: [], sunk: false },
            { id: "S", name: "Submarine", size: 3, placed: false, cells: [], sunk: false },
            { id: "C", name: "Cruiser", size: 3, placed: false, cells: [], sunk: false },
            { id: "D", name: "Destroyer", size: 2, placed: false, cells: [], sunk: false },
        ] //CHANGE TO POPULATE WITH SENT SHIPS LATER
        this.sunkShips = [] //populate with ids (A, B, S, C, D), to send to both users
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
                if (this.isHit(i, j, this.players[opponentID]) && this.players[playerID].guessesBoard[i][j] !== 'H') {
                    return false;
                }

            }
        }
        return true; // all hits match with ships
    }

    checkSunkShip(hitCell, opponentID) {
        //get opponent's ships
        let oppShips = this.players[opponentID].ships

        //go through each ship's cells and see if they contain our hitCell x and y
        for(let i = 0; i < 5; i++) {
            let shipHits = 0
            let isCorrectShip = false

            //for each cell in current ship
            for(let j = 0; j < (oppShips[i].size); j++) {
                if(oppShips[i].cells[j][0] === hitCell.X && oppShips[i].cells[j][1] === hitCell.Y) {
                    //our hit was on ship i, so check if all cells in this ship map to 'H'
                    isCorrectShip = true
                }

                //check if cell maps to a hit
                let x = oppShips[i].cells[j][0]
                let y = oppShips[i].cells[j][1]

                if(this.players[opponentID].personalBoard[x][y] === 'H') {
                    shipHits += 1
                }
            }

            //if this was the ship fired at, check if all the cells are hit, if so, its sunk
            if(isCorrectShip && shipHits === oppShips[i].size) {
                oppShips[i].sunk = true
                this.players[opponentID].sunkShips.push(oppShips[i].name)
                return true
            }
        }

        return false
    }

    isHit(x, y, opponent) {
        if (opponent.personalBoard[x][y] === 'A' || opponent.personalBoard[x][y] === 'B' || opponent.personalBoard[x][y] === 'S' || opponent.personalBoard[x][y] === 'C' || opponent.personalBoard[x][y] === 'D') {
            return true
        }
        else {
            return false
        }
    }


    handleReady(playerID, displayName) {
        this.players[playerID].isReady = true
        this.players[playerID].displayName = displayName

        //check if both are ready, if so, begin!
        if (Object.keys(this.players).length === 2 && this.players[0].isReady && this.players[1].isReady) {
            this.isGameWaiting = 0
            this.isPlacingShips = 1
        }
    }

    handlePlacement(playerID, placements, ships) {
        //update player's placement board
        this.players[playerID].personalBoard = placements
        this.players[playerID].ships = ships
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

        if (this.isHit(x, y, opponent)) {
            //guess was a hit
            this.players[playerID].guessesBoard[x][y] = 'H'
            opponent.personalBoard[x][y] = 'H'
        }
        else {
            //guess was a miss
            this.players[playerID].guessesBoard[x][y] = 'M'
            opponent.personalBoard[x][y] = 'M'
        }

        //check if this sunk a ship
        let didSink = this.checkSunkShip({X: x, Y: y}, opponent.id)

        //check if the player has won
        if (this.isAWinner(playerID, opponent.id)) {
            //if a winner, change game flags
            this.isFiring = 0
            this.isEnd = 1
            this.winner = this.players[playerID].displayName
        }

        return didSink
    }
}


app.get('/create', async (req, res) => {
    let game = new Game()
    const insertedGame = await gameData.insertOne(game)
    const json = {code: insertedGame.insertedId}
    res.json(json)
})

app.ws('/ws', async (client, req) => {
    let objectID;
    try {
        objectID = new ObjectId(req.query.id)
    } catch (e) {
        client.send(JSON.stringify({type: 'InvalidCode', payload: {InvalidCode: true}}));
        return;
    }

    let game;
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
    try {
        await retrieveGame()
    } catch (e) {
        client.send(JSON.stringify({type: 'InvalidCode', payload: {InvalidCode: true}}));
        return;
    }


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
                game.handleReady(client.playerID, payload.DisplayName)

                //send signal to begin placing ships if both ready
                if (!game.isGameWaiting && game.isPlacingShips) {
                    client.send(JSON.stringify({type: 'StartPlacing', payload: {StartPlacing: true, OpponentDisplayName: opponent.displayName}}));
                    try {
                        sockets[opponent.ws].send(JSON.stringify({
                            type: 'StartPlacing',
                            payload: {StartPlacing: true, OpponentDisplayName: game.players[client.playerID].displayName}
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
                game.handlePlacement(client.playerID, payload.Placements, payload.Ships)

                //send signal to begin the firing stage if both players have their placements in
                if (!game.isPlacingShips && game.isFiring) {
                    await updateGameInMongo()
                    client.send(JSON.stringify({type: 'Firing', payload: {YourTurn: true,
                            placingGrid:  game.players[client.playerID].personalBoard, guessGrid: game.players[client.playerID].guessesBoard, Result: "None",
                        PersonalSunkShips: [], OppSunkShips: []}}));
                    try {
                        sockets[opponent.ws].send(JSON.stringify({type: 'Firing', payload: {YourTurn: false,
                                placingGrid: opponent.personalBoard, guessGrid: opponent.guessesBoard, Result: "None",
                            PersonalSunkShips: [], OppSunkShips: []}}));
                    } catch (e) {
                        console.error("Client disconnected during a game")
                        await resetGame()
                    }

                }
            } else if (type === "FiringNonGuess") {
                //player did not submit a guess in time, so let opponent take their turn
                client.send(JSON.stringify({type: 'Firing', payload: {YourTurn: false,
                                placingGrid:  game.players[client.playerID].personalBoard, guessGrid: game.players[client.playerID].guessesBoard, Result: "No Fire",
                            PersonalSunkShips: game.players[client.playerID].sunkShips, OppSunkShips: opponent.sunkShips}}));

                sockets[opponent.ws].send(JSON.stringify({type: 'Firing', payload: {YourTurn: true,
                                    placingGrid: opponent.personalBoard, guessGrid: opponent.guessesBoard, Result: "No Fire",
                                PersonalSunkShips: opponent.sunkShips, OppSunkShips: game.players[client.playerID].sunkShips}}));

            } else if (type === "FiringGuess") {
                try {
                    let hit = false
                    let didSink = false
                    if (payload.GuessX !== -1) {
                        hit = game.isHit(payload.GuessX, payload.GuessY, opponent)
                        didSink = game.handleFiringGuess(client.playerID, payload.GuessX, payload.GuessY)
                        await updateGameInMongo()
                    }
                    //if game is not over, send signal to users to give next guess
                    if (game.isFiring && !game.isEnd) {
                        client.send(JSON.stringify({type: 'Firing', payload: {YourTurn: false,
                                placingGrid:  game.players[client.playerID].personalBoard, guessGrid: game.players[client.playerID].guessesBoard,
                                Result: hit ? 'H' : 'M', DidSink: didSink, PersonalSunkShips: game.players[client.playerID].sunkShips, OppSunkShips: opponent.sunkShips}}));
                        try {
                            sockets[opponent.ws].send(JSON.stringify({type: 'Firing', payload: {YourTurn: true,
                                    placingGrid: opponent.personalBoard, guessGrid: opponent.guessesBoard,
                                    Result: hit ? 'H' : 'M', DidSink: didSink, PersonalSunkShips: opponent.sunkShips, OppSunkShips: game.players[client.playerID].sunkShips}}));
                        } catch (e) {
                            console.log(e)
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
                            console.log(e)
                            console.error("Client disconnected during a game")
                            await resetGame()
                        }

                    }
                } catch (e) {
                    console.log(e)
                    console.log("Client disconnected during a game")
                    await resetGame()
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
            let playerName = 'Opponent'
            if (player) {
                playerName = player.displayName
                delete sockets[game.players[client.playerID].ws]
            }
            if (opponent && sockets[opponent.ws]) {
                sockets[opponent.ws].send(JSON.stringify({type: 'Disconnected', payload: {Disconnected: true, OppName: playerName}}))
                sockets[opponent.ws].close()
                delete sockets[opponent.ws]
            }
            await resetGame()
        }
    });

})


ViteExpress.listen(app, port, () => {
    console.log("Server is listening on port " + port)
    if (process.env.NODE_ENV !== "production") {
        console.log("Access at http://localhost:" + port)
    }
});