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
    const [isWaitingForReady, setIsWaitingForReady] = useState(false)
    const [isPlacing, setIsPlacing] = useState(false)
    const [isFiring, setIsFiring] = useState(false)
    const [isMyFireTurn, setIsMyFireTurn] = useState(false)
    const [isGameEnded, setIsGameEnded] = useState(true)

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
                    setUserMessage(type + payload.YourTurn)

                    //start the firing stage of the game!
                    setIsPlacing(false)
                    setIsFiring(true)

                    //check if current player's turn
                    if (payload.YourTurn) {
                        //do firing functionality to get user's guess square coordinates
                        setIsMyFireTurn(true)

                        //after firing has completed, send coordinates of square back to the server

                        let x = 5
                        let y = 5 //dummy values for now
                        sendFiringSquare(x, y)
                        setIsMyFireTurn(false)
                    } else {
                        //wait on other user to fire
                        setIsMyFireTurn(false)
                    }
                } else if (type === "End") {
                    //game has ended, display winner
                    console.log(payload.Winner)
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
        //update grid
        const tempGrid = firingGridVals.map(row => [...row]);
        tempGrid[x][y] = 'X'
        setFiringGridVals(tempGrid)
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


    return (
        <div className="page">
            <h1 className="text-3xl font-bold tracking-tight mb-6"> Sink 'Em</h1>
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
                    <p>Your code is: <strong>{gameCode}</strong></p>
                    <button className ="btn" onClick={sendReadyToStart}> Ready</button>
                </div>
            )}


            {isPlacing ?
                (<div className="flex flex-col items-center space-y-4">
                        <Grid gridVals={placingGridVals} handleSquareChoice={updateSquareChoicePlacing}></Grid>
                        <button className ="btn" onClick={submitPlacements}> Submit Placements</button>
                    </div>
                )
                : ''}
            {isFiring && isMyFireTurn ?
                (<div className="flex flex-col items-center space-y-4">
                        <p> Choose a square to fire at....</p>
                        <Grid gridVals={firingGridVals} handleSquareChoice={updateSquareChoiceFiring}></Grid>
                        <button className ="btn" onClick={submitPlacements}> Submit Fire Location</button>
                    </div>
                )
                : ''}
            {isFiring && !isMyFireTurn ?
                (<div className="flex flex-col items-center space-y-4">
                        <p> Waiting for other user's guess....</p>
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
