import {useEffect, useRef, useState} from "react";
import "./App.css";
import Grid from "./Grid.jsx";
import BoardWithAxes from "./axis.jsx"

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
    const [firingCoords, setFiringCoords] = useState(false)
    const [isFiring, setIsFiring] = useState(false)
    const [isMyFireTurn, setIsMyFireTurn] = useState(false)
    const [timer, setTimer] = useState(30)
    const [isGameEnded, setIsGameEnded] = useState(false)
    const [switchTurnsCooldown, setSwitchTurnsCooldown] = useState(false)

    // track winner
    const [winner, setWinner] = useState("");


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
                        else if(payload.Result === "None") {
                            setUserMessage("Both players ready. Starting game soon...")
                        }
                        else if(payload.Result === "No Fire") {
                            setUserMessage("Your opponent did not make a guess in time, no shot fired.")
                        }

                        //do firing functionality to get user's guess square coordinates
                        setTimeout(() => {
                            setUserMessage("It is your turn to fire. You have 30 seconds.")
                            setIsMyFireTurn(true)      
                        }, 5000)

                        //after firing has completed, send coordinates of square back to the server
                    } else {
                        //upon receiving the your previous shot's hit/miss update, show your guess board 
                        //for 5 seconds before moving to showing your personal board
                        if(payload.Result === 'H') {
                            setSwitchTurnsCooldown(true)
                            setUserMessage("You hit a ship!")
                        }
                        else if(payload.Result === 'M') {
                            setSwitchTurnsCooldown(true)
                            setUserMessage("You missed!")
                        }
                        else if(payload.Result === "None") {
                            setUserMessage("Both players ready. Starting game soon...")
                        }
                        else if(payload.Result === "No Fire") {
                            setUserMessage("You did not make a guess in time, no shot fired.")
                        }

                        setTimeout(() => {
                            //wait on other user to fire
                            setUserMessage("Waiting for the opponent to fire")
                            setIsMyFireTurn(false)
                            setSwitchTurnsCooldown(false)
                        }, 5000)
                    }

                } else if (type === "End") {
                    //game has ended, display winner
                    console.log(payload.Winner)
                    setUserMessage('')
                    setWinner(payload.Winner)
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

        //check if square has already been guessed, if not, set
        if(firingGridVals[x][y] === 'H' || firingGridVals[x][y] === 'M') {
            return
        }
        else {
            setFiringCoords ({x, y})
        }
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

    const submitFiringCoords = () => {
      if (!firingCoords){
        return
      }

      const {x, y} = firingCoords
      sendFiringSquare(x, y)
      setFiringCoords(null)

      setTimeout (() => {
        setIsMyFireTurn(false)
      }, 5000)
    }

    const sendFiringSquare = (x, y) => {
        console.log("sending firing guess square:", x, y)
        ws.current.send(JSON.stringify({type: 'FiringGuess', payload: {GuessX: x, GuessY: y}}));
    }

    const goHome = () => {
        try { ws.current?.close(); } catch {}
        ws.current = null;

        // reset states for new game
        setPlacingGridVals(Array.from({ length: 10 }, () => Array(10).fill(null)));
        setFiringGridVals(Array.from({ length: 10 }, () => Array(10).fill(null)));
        setUserMessage("");
        setGameCode("");
        setGameCreated(false);
        setJoiningGame(false);
        setJoinCode("");
        setIsWaitingForReady(true);
        setIsPlacing(false);
        setIsFiring(false);
        setIsMyFireTurn(false);
        setIsGameEnded(false);
        setWinner("");
        };


    const killTimer = useRef(null)

      useEffect(() => {
        if (isMyFireTurn) {
          setTimer (30)

          killTimer.current = setInterval(() => {
            setTimer (t => {
              if (t <= 1) {
                clearInterval(killTimer.current)
                setIsMyFireTurn(false)

                //send non-guess to server
                ws.current.send(JSON.stringify({type: 'FiringNonGuess', payload: "None"}));
                return 0
              }
              return t - 1
            })
          }, 1000)
        }
        return () => {
          if (killTimer.current) {
            clearInterval(killTimer.current)
            killTimer.current = null
          }
        }
      }, [isMyFireTurn])


    return (
        <div className="page">
            <h1 className="h1"> Sink 'Em</h1>
            {userMessage}
            {!gameCreated && !joiningGame && (
                <div className="flex flex-col items-center space-y-4">
                    <button className ="btn" onClick={makeGame}>Create Game</button>
                    <br></br>
                    <br></br>
                    <button className ="btn" onClick={() => {setJoiningGame(true); setUserMessage('')}}>Join Existing Game</button>
                </div>
            )}

            {joiningGame && !gameCreated && (

                <div className="flex flex-col items-center space-y-4">
                    <p>Enter code here:</p>
                    <input type="text" value={joinCode} onChange={(i) => setJoinCode(i.target.value)} className="border-2 border-gray-300 rounded-md p-2 text-black bg-white"/>
                    <br></br>
                    <br></br>
                    <button className ="btn" onClick={joinGame}>Join game</button>
                </div>
            )}

            {gameCreated && isWaitingForReady && (
                <div className="flex flex-col items-center space-y-4">
                    <div className="code">
                        <p>Your code is: <strong>{gameCode}</strong></p> 
                        {/* copy to clipbaord button  */}
                        <button
                            type="button"
                            onClick={async () => {
                                await navigator.clipboard.writeText(gameCode);   // ← copy!
                            }} className="btn-copy"> 
                            {/* Clipboard icon */}
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
                            />
                            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                            </svg>
                        </button>
                    </div>
                    <button className ="btn" onClick={sendReadyToStart}> Ready</button>
                </div>
                
            )}
            {isPlacing ?
                (<div className="flex flex-col items-center space-y-4">
                    <BoardWithAxes>
                        <Grid gridVals={placingGridVals} handleSquareChoice={updateSquareChoicePlacing}></Grid>
                    </BoardWithAxes>
                        <button className ="btn" onClick={submitPlacements}> Submit Placements</button>
                    </div>
                )
                : ''}
            {isFiring && isMyFireTurn ?
                (<div className="flex flex-col items-center space-y-4">
                        { !switchTurnsCooldown ? (<p>Time remaining: {timer} </p>) : '' }
                        <p> Your Targeting Grid: </p>
                        <Grid gridVals={firingGridVals} handleSquareChoice={updateSquareChoiceFiring} selected={firingCoords}></Grid>
                        { !switchTurnsCooldown ? <button className ="btn" onClick={submitFiringCoords} disabled={!firingCoords}> Submit Fire Location</button>  : '' }
                    </div>
                )
                : ''}
            {isFiring && !isMyFireTurn ?
                (<div className="flex flex-col items-center space-y-4">
                        <p> Your Fleet Grid: </p>
                        <Grid gridVals={placingGridVals} handleSquareChoice={() => console.log(`Clicked square`)}></Grid>
                    </div>
                )
                : ''}
            {isGameEnded ? (
                <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-2xl font-bold">Game Over</h2>
                    <p className="text-lg">Winner: <strong>{winner}</strong></p>
                    <p> Game has ended</p>
                    <button className="btn" onClick={goHome}>Play again!</button>
                </div>
            ) : ''
            }
        </div>
    );
}

export default App;
