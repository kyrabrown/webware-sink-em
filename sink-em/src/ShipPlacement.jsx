import {useEffect, useMemo, useState } from "react";
import Grid from "./Grid.jsx";
//import "./App.css";


const SIZE = 10;

const makeEmptyBoard = () => Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));

// Battleship definitions (ids used on the board to mark ship cells)
const INITIAL_SHIPS = [
    { id: "A", name: "Aircraft Carrier", size: 5, placed: false, cells: [] },
    { id: "B", name: "Battleship",      size: 4, placed: false, cells: [] },
    { id: "S", name: "Submarine",       size: 3, placed: false, cells: [] },
    { id: "C", name: "Cruiser",         size: 3, placed: false, cells: [] },
    { id: "D", name: "Destroyer",       size: 2, placed: false, cells: [] },
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
    const [ships, setShips] = useState(() => INITIAL_SHIPS.map(s => ({ ...s })));
    const [selectedShipId, setSelectedShipId] = useState(INITIAL_SHIPS[0].id);
    const [orientation, setOrientation] = useState("H"); // H = horizontal, V = vertical


    const selectedShip = useMemo(
        () => ships.find(s => s.id === selectedShipId) ?? null,
        [ships, selectedShipId]
        );


    // Keyboard: R rotates, and 1 through5 selects ships (that are not placed)
    useEffect(() => {
    const onKeyDown = (e) => {
        if (e.key === "r" || e.key === "R") {
        setOrientation(o => (o === "H" ? "V" : "H"));
        return;
        }
        const idx = Number(e.key) - 1;
        if (idx >= 0 && idx < INITIAL_SHIPS.length) {
        const wantedId = INITIAL_SHIPS[idx].id;
        const wanted = ships.find(s => s.id === wantedId);
        if (wanted && !wanted.placed) setSelectedShipId(wantedId);
        }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    }, [ships]);


    // Handle click to place ship if valid
    const handleSquareClick = (r, c) => {
        if (!selectedShip) return;
        const cells = cellsForPlacement(r, c, selectedShip.size, orientation);
        if (!isInBounds(cells)) return; // ignores invalid placement
        if (overlaps(board, cells)) return; // ignores overlaps

        //const newBoard = board.map(row => [...row + selectedShip.size]); 
        //for (const [rr, cc] of cells) newBoard[rr][cc] = '#1E90FF'; 
        //console.log("Placing ship at:", cells);

        const newBoard = board.map(row => [...row]);
        for (const [rr, cc] of cells) newBoard[rr][cc] = selectedShip.id;
        setBoard(newBoard);

        // marks ship placed and auto-select next
        setShips(prev => {
        const updated = prev.map(s =>
            s.id === selectedShip.id ? { ...s, placed: true, cells } : s
        );
        const next = updated.find(s => !s.placed);
        setSelectedShipId(next ? next.id : null);
        return updated;
        });

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

    const gridVals = board;

    
    return (
        <div>
            <h2>Place your ships</h2>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div>
                    <Grid gridVals={gridVals} handleSquareChoice={handleSquareClick} />
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