import { useState, useEffect, useRef } from "react";
import "./App.css";
import Grid from "./Grid.jsx";

function App() {
  const [gridVals, setGridVals] =  useState(
    Array.from({ length: 10 }, () => Array(10).fill(null))
  );
  const ws = useRef(null);

  useEffect(() => {

    ws.current = new WebSocket("ws://localhost:3000"); 

    ws.current.onopen = () => {
      console.log("Connected to WS server");
      
      ws.current.onmessage = async msg => {
        const newGrid = JSON.parse(msg.data);
        setGridVals(newGrid);
      };
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    //ask for most up to date board 
    getBoard()

  }, []);

  const getBoard = async () => {
    const response = await fetch('/api/board', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const newGrid = await response.json();
      setGridVals(newGrid);
  }

  const sendSquareChoice = (x, y) => {
    //update grid
    const tempGrid = gridVals.map(row => [...row]);
    tempGrid[x][y] = 'X'
    setGridVals(tempGrid)

    //send selected square coordinates
    ws.current.send(JSON.stringify([x, y]));
  };

  return (
    <div className="App">
      <h1> Sink 'Em</h1>

      <Grid gridVals={gridVals} sendSquareChoice={sendSquareChoice}></Grid>
    </div>
  );
}

export default App;
