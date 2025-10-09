import "./App.css";


function GridSquare({ row, col, onClick, value, isSelected, isForPlacing }) {
  
  let color = 'yellow'

  //get background color
  if(isForPlacing && value) {
    color = '#0b84ff'
  }
  else if(!isForPlacing && isSelected) {
    color = 'yellow'
  }
  else {
    color = 'white'
  }

  console.log("here!2")

  return (
    <div
      onClick={() => onClick(row, col)}
       style={{ backgroundColor: color}}
    >
      {value}
    </div>
  );
}


export default function Grid({gridVals, handleSquareChoice, selected, isForPlacing}) {

  // Handle square click
  const handleClick = (row, col) => {
    handleSquareChoice(row, col)
  };

  console.log("here!1")
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
              // isForPlacing={isForPlacing}
          />
          ))
        )}
      </div>
    // </div>
  );
}
