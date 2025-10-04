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

  const ws = useRef(null);

  useEffect(() => {

    ws.current = new WebSocket("ws://localhost:3000"); 

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
        else if (type === "StartPlacing") {
          setUserMessage(type)

          //change game state
          setIsWaitingForReady(false)
          setIsPlacing(true)
        }
        else if (type == "Firing") {
          setUserMessage(type)
          
          //start the firing stage of the game!
          setIsPlacing(false)
          setIsFiring(true)

          //check if current player's turn
        
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
    tempGrid[x][y] = 'X'
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
    ws.current.send(JSON.stringify({ type:'Placed', payload: { Placements: placingGridVals }}));
  }

  return (
    <div className="App">
      <h1> Sink 'Em</h1>
      <p>{userMessage}</p>
      {isWaitingForReady ? <button onClick={sendReadyToStart}> Ready </button> : ''}
      {isPlacing ? 
        (<div> 
            <Grid gridVals={placingGridVals} updateSquareChoice={updateSquareChoicePlacing}></Grid> 
            <button onClick={submitPlacements}> Submit Placements </button>
          </div>
        )
        : ''}
      {isFiring ? 
        (<div> 
            <Grid gridVals={firingGridVals} updateSquareChoice={updateSquareChoiceFiring}></Grid> 
            <button onClick={submitPlacements}> Submit Fire Location </button>
          </div>
        )
        : ''}
    </div>
  );
}

export default App;
