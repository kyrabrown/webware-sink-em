import {useRef, useState} from "react";
import "./App.css";
import Grid from "./Grid.jsx";

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

                    //change game state
                    setIsWaitingForReady(false)
                    setIsPlacing(true)
                } else if (type === "Firing") {

                    //update boards
                    setFiringGridVals(payload.guessGrid)
                    setPlacingGridVals(payload.placingGrid)

                    //start the firing stage of the game!
                    setIsPlacing(false)
                    setIsFiring(true)

                    //check if current player's turn
                    if (payload.YourTurn) {
                        //upon receiving the opponent's hit/miss update, show your personal board 
                        //for 5 seconds before moving to showing your firing board 
                        if(payload.Result === 'H') {
                            setUserMessage("Your opponent hit your ship!")
                        }
                        else if(payload.Result === 'M') {
                            setUserMessage("Your opponent missed!")
                        }

                        //do firing functionality to get user's guess square coordinates
                        setTimeout(() => {
                            setUserMessage("It is your turn to fire. You have 30 seconds.")
                            setIsMyFireTurn(true)      
                            startTimer()
                        }, 5000)

                        //after firing has completed, send coordinates of square back to the server
                    } else {
                        //upon receiving the your previous shot's hit/miss update, show your guess board 
                        //for 5 seconds before moving to showing your personal board
                        if(payload.Result === 'H') {
                            setUserMessage("You hit a ship!")
                        }
                        else if(payload.Result === 'M') {
                            setUserMessage("You missed!")
                        }

                        setTimeout(() => {
                            //wait on other user to fire
                            setUserMessage("Waiting for the opponent to fire")
                            setIsMyFireTurn(false)
                        }, 5000)
                    }

                } else if (type === "End") {
                    //game has ended, display winner
                    console.log(payload.Winner)
                    setUserMessage("Game over.")
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
        console.log("sending ready")
        ws.current.send(JSON.stringify({type: 'Ready', payload: {Ready: true}}));
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
                    <button onClick={sendReadyToStart}> Ready</button>
                </div>
            )}


            {isPlacing ?
                (<div>
                        <Grid gridVals={placingGridVals} handleSquareChoice={updateSquareChoicePlacing}></Grid>
                        <button onClick={submitPlacements}> Submit Placements</button>
                    </div>
                )
                : ''}
            {isFiring && isMyFireTurn ?
                (<div>
                        <p>Time remaining: {timer} </p>
                        <Grid gridVals={firingGridVals} handleSquareChoice={updateSquareChoiceFiring}></Grid>
                        <button onClick={submitPlacements}> Submit Fire Location</button>
                    </div>
                )
                : ''}
            {isFiring && !isMyFireTurn ?
                (<div>
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
