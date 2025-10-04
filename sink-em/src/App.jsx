import { useState, useEffect, useRef } from "react";
import "./App.css";
import Grid from "./Grid.jsx";

function App() {
  const [placingGridVals, setPlacingGridVals] =  useState(Array.from({ length: 10 }, () => Array(10).fill(null)));
  const [firingGridVals, setFiringGridVals] =  useState(Array.from({ length: 10 }, () => Array(10).fill(null)));
  const [userMessage, setUserMessage] = useState('')
  const [isWaitingForReady, setIsWaitingForReady] = useState(true)
  const [isPlacing, setIsPlacing] = useState(false)
  const [isFiring, setIsFiring] = useState(false)
  const [isMyFireTurn, setIsMyFireTurn] = useState(false)
  const [isGameEnded, setIsGameEnded] = useState(false)

  const ws = useRef(null);

  useEffect(() => {

    ws.current = new WebSocket("/ws?id=68e17ba5b244e21f5d034032");

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
        const { type, payload } = msg;
        if(type === "Waiting") {
          setUserMessage(type)
        }
          else if(type === "Full") {
              setUserMessage(type)
          }
        else if (type === "StartPlacing") {
          setUserMessage(type)

          //change game state
          setIsWaitingForReady(false)
          setIsPlacing(true)
        }
        else if (type == "Firing") {
          setUserMessage(type + payload.YourTurn)
          
          //start the firing stage of the game!
          setIsPlacing(false)
          setIsFiring(true)

          //check if current player's turn
          if(payload.YourTurn) {
            //do firing functionality to get user's guess square coordinates
            setIsMyFireTurn(true)

            //after firing has completed, send coordinates of square back to the server

            let x = 5
            let y = 5 //dummy values for now
            sendFiringSquare(x, y)
            setIsMyFireTurn(false)
          }
          else {
            //wait on other user to fire
            setIsMyFireTurn(false)
          }
        }
        else if (type === "End") {
          //game has ended, display winner 
          console.log(payload.Winner)
          setIsMyFireTurn(false)
          setIsFiring(false)
          setIsGameEnded(true)
        }
        else {
          setUserMessage(type)
        }
      };
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
    console.log("Cleaning up WS connection");
    ws.current?.close();
  };

  }, []);

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

  const sendReadyToStart = () => {
    console.log("sending ready")
    ws.current.send(JSON.stringify({ type:'Ready', payload: { Ready: true }}));
  }

  const submitPlacements = () => {
    console.log("sending placement grid")
    const tempGrid = placingGridVals.map(row => [...row]);
    console.log("placing grid cals", placingGridVals)
    ws.current.send(JSON.stringify({ type:'Placed', payload: { Placements: placingGridVals }}));
  }

  const sendFiringSquare = (x, y) => {
    console.log("sending firing guess square:", x, y)
    ws.current.send(JSON.stringify({ type:'FiringGuess', payload: { GuessX: x, GuessY: y }}));
  }

  return (
    <div className="App">
      <h1> Sink 'Em</h1>
      <p>{userMessage}</p>
      {isWaitingForReady ? <button onClick={sendReadyToStart}> Ready </button> : ''}
      {isPlacing ? 
        (<div> 
            <Grid gridVals={placingGridVals} handleSquareChoice={updateSquareChoicePlacing}></Grid> 
            <button onClick={submitPlacements}> Submit Placements </button>
          </div>
        )
        : ''}
      {isFiring && isMyFireTurn ? 
        (<div> 
            <p> Choose a square to fire at....</p>
            <Grid gridVals={firingGridVals} handleSquareChoice={updateSquareChoiceFiring}></Grid> 
            <button onClick={submitPlacements}> Submit Fire Location </button>
          </div>
        )
        : ''}
      {isFiring && !isMyFireTurn ? 
        (<div> 
            <p> Waiting for other user's guess....</p>
            <Grid gridVals={placingGridVals} handleSquareChoice={console.log(`Clicked square`)}></Grid> 
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
