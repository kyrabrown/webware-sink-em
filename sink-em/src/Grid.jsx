import "./App.css";


function GridSquare({ row, col, onClick, value }) {
  return (
    <div
      onClick={() => onClick(row, col)}
      className="square"
      style={{ backgroundColor: value ? '#0b84ff' : undefined }}
    >
      {null}
    </div>
  );
}


export default function Grid({gridVals, handleSquareChoice}) {

  // Handle square click
  const handleClick = (row, col) => {

    console.log(`Clicked square at row ${row}, col ${col}`);

    handleSquareChoice(row, col)
  };

  return (
    <div className="grid">
      {gridVals.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <GridSquare
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            value={value}
            onClick={handleClick}
          />
        ))
      )}
    </div>
  );
}
