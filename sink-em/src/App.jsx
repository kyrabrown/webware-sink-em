import {useRef, useState} from "react";
import "./App.css";
import Grid from "./Grid.jsx";
import { generateUsername } from "unique-username-generator";

function App() {
    const [placingGridVals, setPlacingGridVals] = useState(Array.from({length: 10}, () => Array(10).fill(null)));
    const [firingGridVals, setFiringGridVals] = useState(Array.from({length: 10}, () => Array(10).fill(null)));
    const [userMessage, setUserMessage] = useState('')
    const [gameCode, setGameCode] = useState('')
    const [gameCreated, setGameCreated] = useState(false)
    const [joiningGame, setJoiningGame] = useState(false)
    const [joinCode, setJoinCode] = useState('')
    const [isWaitingForReady, setIsWaitingForReady] = useState(true)
    const [isPlacing, setIsPlacing] = useState(false)
    const [isFiring, setIsFiring] = useState(false)
    const [isMyFireTurn, setIsMyFireTurn] = useState(false)
    const [timer, setTimer] = useState(30)
    const [isGameEnded, setIsGameEnded] = useState(false)
    let usernameComponents = generateUsername("-").split("-")
    usernameComponents = usernameComponents.map((component) => component.charAt(0).toUpperCase() + component.slice(1))
    const [displayName, setDisplayName] = useState(usernameComponents[0] + usernameComponents[1])
    const [opponentDisplayName, setOpponentDisplayName] = useState("Opponent")

    const ws = useRef(null);

    const makeNewWS = (code) => {
        if (ws.current) {
            ws.current.close()
        }
        ws.current = new WebSocket(`/ws/?id=${code}`)

        ws.current.onopen = () => {
            console.log("Connected to WS server");

            ws.current.onmessage = async msgSent => {
                let msg;
                try {
                    msg = JSON.parse(msgSent.data);
                } catch (e) {
                    console.error("Invalid JSON:", msgSent);
                    return;
                }

                console.log("received", msg)
                const {type, payload} = msg;
                if (type === "Waiting") {
                    setUserMessage(type)
                } else if (type === "Full") {
                    setUserMessage(type)
                } else if (type === "InvalidCode") {
                    setUserMessage("Invalid code.")
                    setGameCode('')
                    setJoinCode('')
                    setJoiningGame(false)
                    setGameCreated(false)
                } else if (type === "Disconnected") {
                    setUserMessage("Your opponent has disconnected. The game has been reset. Reload to create a new game.")
                } else if (type === "StartPlacing") {
                    setUserMessage(type)
                    setOpponentDisplayName(payload.OpponentDisplayName)
                    //change game state
                    setIsWaitingForReady(false)
                    setIsPlacing(true)
                } else if (type === "Firing") {
                    setUserMessage(type + payload.YourTurn)

                    //start the firing stage of the game!
                    setIsPlacing(false)
                    setIsFiring(true)

                    if (payload.Result === 'H' || payload.Result === 'M') {
                      setFiringGridVals(oldGrid => {
                        const updateGrid = oldGrid.map(row => [...row])
                      updateGrid[payload.X][payload.Y] = payload.Result
                      return updateGrid
                      })
                    }

                    //check if current player's turn
                    if (payload.YourTurn) {
                        //do firing functionality to get user's guess square coordinates
                        setIsMyFireTurn(true)      
                        
                        startTimer()

                        //after firing has completed, send coordinates of square back to the server
                    } else {
                        //wait on other user to fire
                        setIsMyFireTurn(false)
                    }
                } else if (type === "End") {
                    //game has ended, display winner
                    console.log(payload.Winner)
                    setUserMessage("Winner: " + payload.Winner)
                    setIsMyFireTurn(false)
                    setIsFiring(false)
                    setIsGameEnded(true)
                } else {
                    setUserMessage(type)
                }
            };


            ws.current.onclose = () => {
                console.log("WebSocket connection closed");
            };

            return () => {
                console.log("Cleaning up WS connection");
                ws.current?.close();
            };

        }
    }
    const updateSquareChoicePlacing = (x, y) => {
        //update grid
        const tempGrid = placingGridVals.map(row => [...row]);
        tempGrid[x][y] = 'S'
        setPlacingGridVals(tempGrid)
    };

    const updateSquareChoiceFiring = (x, y) => {
              if (!isMyFireTurn) {
          return
        }

        //update grid
        sendFiringSquare(x,y)
    };

    const makeGame = async () => {
        const res = await fetch("/create", {method: "GET"})
        const json = JSON.parse((await res.text()))
        setGameCode(json.code)
        setGameCreated(true)
        makeNewWS(json.code)
    }

    const joinGame = async () => {
        const code = joinCode.trim();
        if (!code) {
            return
        }
        setGameCode(code)
        setJoiningGame(true)
        setGameCreated(true)
        makeNewWS(code)
    }

    const sendReadyToStart = () => {
        if (displayName.length > 0){
            console.log("sending ready")
            ws.current.send(JSON.stringify({type: 'Ready', payload: {Ready: true, DisplayName: displayName}}));
        } else {
            alert("You must choose a display name!")
        }
    }

    const submitPlacements = () => {
        console.log("sending placement grid")
        const tempGrid = placingGridVals.map(row => [...row]);
        console.log("placing grid cals", placingGridVals)
        ws.current.send(JSON.stringify({type: 'Placed', payload: {Placements: placingGridVals}}));
    }

    const sendFiringSquare = (x, y) => {
        console.log("sending firing guess square:", x, y)
        ws.current.send(JSON.stringify({type: 'FiringGuess', payload: {GuessX: x, GuessY: y}}));
    }

    function startTimer () {
      setTimer(30)
        const interval = setInterval(() => {
          setTimer((t) => {
            if (t === 0) {
              clearInterval(interval)
              setIsMyFireTurn(false)
            }
            return t - 1
          })
        }, 1000)
    }

    return (
        <div className="App">
            <h1> Sink 'Em</h1>
            {userMessage}
            {!gameCreated && !joiningGame && (
                <div>
                    <button onClick={makeGame}>Create Game</button>
                    <br></br>
                    <br></br>
                    <button onClick={() => {setJoiningGame(true); setUserMessage('')}}>Join Existing Game</button>
                </div>
            )}

            {joiningGame && !gameCreated && (

                <div>
                    <p>Enter code here:</p>
                    <input type="text" value={joinCode} onChange={(i) => setJoinCode(i.target.value)}/>
                    <br></br>
                    <br></br>
                    <button onClick={joinGame}>Join game</button>
                </div>

            )}

            {gameCreated && isWaitingForReady && (
                <div>
                    <p>Your code is: <strong>{gameCode}</strong></p>
                    <p>Choose a display name:</p>
                    <input type="text" value={displayName} onChange={(i) => setDisplayName(i.target.value)}/>
                    <button onClick={sendReadyToStart}> Ready</button>
                </div>
            )}



            {isPlacing ?
                (
                    <div>
                        <p>You are: {displayName}</p>
                        <p>You're up against: {opponentDisplayName}</p>
                        <Grid gridVals={placingGridVals} handleSquareChoice={updateSquareChoicePlacing}></Grid>
                        <button onClick={submitPlacements}> Submit Placements</button>
                    </div>
                )
                : ''}
            {isFiring && isMyFireTurn ?
                (<div>
                        <p> Choose a square to fire at....</p>
                        <p>Time remaining: {timer} </p>
                        <Grid gridVals={firingGridVals} handleSquareChoice={updateSquareChoiceFiring}></Grid>
                        <button onClick={submitPlacements}> Submit Fire Location</button>
                    </div>
                )
                : ''}
            {isFiring && !isMyFireTurn ?
                (<div>
                        <p> {opponentDisplayName} is guessing...</p>
                        <Grid gridVals={placingGridVals} handleSquareChoice={() => console.log(`Clicked square`)}></Grid>
                    </div>
                )
                : ''}
            {isGameEnded ? (
                <p> Game has ended</p>) : ''
            }
        </div>
    );
}

export default App;
