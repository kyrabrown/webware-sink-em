import { useEffect, useMemo, useState } from "react";
import Grid from "./Grid.jsx";
//import "./App.css";


const SIZE = 10;

const makeEmptyBoard = () => Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));

// Battleship definitions (ids used on the board to mark ship cells)
const INITIAL_BATTLES = [
    { id: "A", name: "Aircraft Carrier", size: 5, placed: false, cells: [] },
    { id: "B", name: "Battleship", size: 4, placed: false, cells: [] },
    { id: "S", name: "Submarine", size: 3, placed: false, cells: [] },
    { id: "C", name: "Cruiser", size: 3, placed: false, cells: [] },
    { id: "D", name: "Destroyer", size: 2, placed: false, cells: [] },
];

// Get the list of cells a ship would occupy given starting cell, size, and orientation
function cellsForPlacement(row, col, size, orientation) {
    const cells = [];
    for (let i = 0; i < size; i++) {
        cells.push(orientation === "H" ? [row, col + i] : [row + i, col]);
    }
    return cells;
}

// Check if all cells are within board bounds
function isInBounds(cells) {
    return cells.every(([r, c]) => r >= 0 && r < SIZE && c >= 0 && c < SIZE);
}

// Check if any of the cells overlap existing ships on the board
function overlaps(board, cells) {
    return cells.some(([r, c]) => board[r][c] !== null);
}


// Component for placing ships on the board
export default function ShipPlacement({ onDone }) {
    const [board, setBoard] = useState(() => makeEmptyBoard());
    const [ships, setShips] = useState(() => INITIAL_BATTLES.map(s => ({ ...s })));
    const [selectedShipId, setSelectedShipId] = useState(ships[0]?.id ?? null);
    const [orientation, setOrientation] = useState("H"); // H = horizontal, V = vertical
        // hover preview state intentionally omitted: Grid doesn't expose hover events
        const [hoverCells] = useState([]);

    const selectedShip = useMemo(() => ships.find(s => s.id === selectedShipId) ?? null, [ships, selectedShipId]);

    // Temporary selector for ship placement
    shipSelector(); {

        if (onKeyDown.key === "1" && placed === false) {
        setSelectedShipId(ships["A"]?.id ?? null);
        console.log("Selected: " + ships["A"]?.name ?? null);
        }
        if (onKeyDown.key === "2" && placed === false) { 
            setSelectedShipId(ships["B"]?.id ?? null);
            console.log("Selected: " + ships["B"]?.name ?? null);
        }
        if (onKeyDown.key === "3" && placed === false) {
            setSelectedShipId(ships["S"]?.id ?? null);
            console.log("Selected: " + ships["S"]?.name ?? null);
        } 
        if (onKeyDown.key === "4" && placed === false) {
            setSelectedShipId(ships["C"]?.id ?? null);
            console.log("Selected: " + ships["C"]?.name ?? null);
        }
        if (onKeyDown.key === "5" && placed === false) {
            setSelectedShipId(ships["D"]?.id ?? null);
            console.log("Selected: " + ships["D"]?.name ?? null);
        }
        
    }
    
    // Handle 'R' key to rotate orientation
    useEffect(() => {
        const onKeyDown = e => {
            if (e.key === "r" || e.key === "R") setOrientation(o => (o === "H" ? "V" : "H"));
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // Handle click to place ship if valid
    const handleSquareClick = (r, c) => {
        if (!selectedShip) return;
        const cells = cellsForPlacement(r, c, selectedShip.size, orientation);
        if (!isInBounds(cells)) return; // ignores invalid placement
        if (overlaps(board, cells)) return; // ignores overlaps

        // place ship
        const newBoard = board.map(row => [...row + selectedShip.size]); //it is suppposed to make the number of squares selected the same as the ship size But it is not working yet :(
        for (const [rr, cc] of cells) newBoard[rr][cc] = '#1E90FF'; //changes the square to represent ship as blue


        setBoard(newBoard);

        // mark ship as placed
        setShips(prev => prev.map(s => (s.id === selectedShip.id ? { ...s, placed: true, cells } : s)));

        // pick next unplaced ship automatically
            const next = ships.find(s => !s.placed && s.id !== selectedShip.id);
            setSelectedShipId(next ? next.id : null);
    };

    // remove last placed ship (undo) - convenience used during dev
    const removeShip = id => {
        const ship = ships.find(s => s.id === id);
        if (!ship || !ship.placed) return;
            const newBoard = board.map(row => [...row]);
        for (const [r, c] of ship.cells) newBoard[r][c] = null;
            setBoard(newBoard);
            setShips(prev => prev.map(s => (s.id === id ? { ...s, placed: false, cells: [] } : s)));
            setSelectedShipId(id);
    };

    useEffect(() => {
        // when all ships placed, call onDone with the board
        if (ships.every(s => s.placed)) {
            onDone?.(board);
        }
    }, [ships, board, onDone]);

    // Render board values for Grid: show ship ids or hover preview 'S'
    const gridVals = board.map(row => [...row]);
    for (const [r, c] of hoverCells) {
        if (r >= 0 && r < SIZE && c >= 0 && c < SIZE && gridVals[r][c] === null) {
            gridVals[r][c] = (newBoard[rr][cc] = '#67CADB'); // visual hover marker
        }
    }

    return (
        <div>
            <h2>Place your ships</h2>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div>
                    <Grid gridVals={gridVals} handleSquareChoice={(r, c) => handleSquareClick(r, c)} />
                </div>
                <div style={{ textAlign: "left" }}>
                    <div>
                        <strong>Orientation:</strong> {orientation} (press 'R' to rotate)
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <strong>Ships</strong>
                        <ul>
                            {ships.map(s => (
                                <li key={s.id} style={{ marginBottom: 6 }}>
                                    <button
                                        onClick={() => setSelectedShipId(s.id)}
                                        disabled={s.placed}
                                        style={{ marginRight: 8 }}
                                    >
                                        {s.name} ({s.size})
                                    </button>
                                    {s.placed ? (
                                        <button onClick={() => removeShip(s.id)}>Remove</button>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}