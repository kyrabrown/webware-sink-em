import { useState } from "react";
import "./App.css";


function GridSquare({ row, col, onClick, value, isSelected }) {
  
  const squareCSS = {backgroundColor: isSelected ? 'yellow' : 'white'}

  return (
    <div
      onClick={() => onClick(row, col)}
      className= {`square ${isSelected ? 'selected' : ''}`}
      style={squareCSS}
    >
      {value}
    </div>
  );
}


export default function Grid({gridVals, handleSquareChoice, selected}) {

  // Handle square click
  const handleClick = (row, col) => {
    console.log(`Clicked square at row ${row}, col ${col}`);

    handleSquareChoice(row, col)
  };

  return (
    // <div className="card">
      <div className="board-grid">
        {gridVals.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <GridSquare
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              value={value}
              onClick={handleClick}
              isSelected={selected && selected.x === rowIndex && selected.y ===colIndex}
          />
          ))
        )}
      </div>
    // </div>
  );
}
